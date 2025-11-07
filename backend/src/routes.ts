import express from "express";
import cors from "cors";
import { z } from "zod";
import { initDb, db } from "./db.js";
import { createMeeting, getMeeting } from "./services/meetingService.js";
import { getParticipantByToken, submitParticipantInput, haveAllSubmitted } from "./services/participantService.js";
import { ensurePersonasForMeeting, runOneTurn, attemptConclusion, generateFinalReport, appendTurn, getHistory } from "./services/conversationService.js";
import { createParticipantUrl } from "./util.js";
import { sendInvitationEmail } from "./email.js";
import { requireHost } from "./auth.js";
import { broadcastStatus, broadcastTurn } from "./realtimeBus.js";
import { getRateLimiterStatus } from "./llm/gemini.js";
import { personaQueue } from "./llm/personaQueue.js";

initDb();

export const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || ["*"], credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Health
app.get("/api/health", (_, res) => res.json({ ok: true }));

// Rate limiter and queue status (for monitoring)
app.get("/api/system/status", requireHost, (req, res) => {
  res.json({
    rateLimiter: getRateLimiterStatus(),
    personaQueue: personaQueue.getStatus(),
  });
});

// Debug endpoint to get participant tokens for a meeting
app.get("/api/meetings/:id/participants", requireHost, (req, res) => {
  const participants = db.prepare("SELECT id, email, token, hasSubmitted FROM participants WHERE meetingId = ?").all(req.params.id);
  res.json({ participants });
});

// Meeting creation
const CreateMeetingSchema = z.object({
  subject: z.string().min(3),
  details: z.string().min(3),
  participants: z.array(z.string().email()).min(1),
  participantBaseUrl: z.string().url()
});
app.post("/api/meetings", requireHost, async (req, res) => {
  const parse = CreateMeetingSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.message });
  const { subject, details, participants, participantBaseUrl } = parse.data;
  const meeting = createMeeting(subject, details, participants);

  // Generate invitation links
  const invitationLinks = meeting.participants.map(p => ({
    email: p.email,
    link: createParticipantUrl(participantBaseUrl, p.token)
  }));

  // Send emails
  for (const p of meeting.participants) {
    const url = createParticipantUrl(participantBaseUrl, p.token);
    try {
      await sendInvitationEmail(p.email, meeting.subject, url);
    } catch (e) {
      console.error("Email error", e);
    }
  }

  res.json({ 
    id: meeting.id, 
    subject: meeting.subject, 
    details: meeting.details, 
    participants: meeting.participants.map(p => ({ id: p.id, email: p.email })),
    invitationLinks 
  });
});

// Participant landing via token
app.get("/api/participant", (req, res) => {
  const token = String(req.query.token || "");
  if (!token) return res.status(400).json({ error: "Missing token" });
  const participant = getParticipantByToken(token);
  if (!participant) return res.status(404).json({ error: "Invalid link" });
  
  // Get full meeting data
  const meeting = getMeeting(participant.meetingId);
  
  // Structure response to match frontend expectations
  res.json({ 
    participant: {
      id: participant.id,
      email: participant.email,
      name: participant.email, // Use email as name fallback
      hasSubmitted: participant.hasSubmitted
    },
    meeting: {
      id: participant.meetingId,
      subject: participant.meetingSubject,
      details: participant.meetingDetails,
      status: meeting.status
    }
  });
});

// Submit participant input
const SubmitInputSchema = z.object({ 
  token: z.string(), 
  content: z.string().min(10),
  name: z.string().min(1).optional() // Optional participant name
});
app.post("/api/participant/submit", async (req, res) => {
  const parse = SubmitInputSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.message });
  const participant = getParticipantByToken(parse.data.token);
  if (!participant) return res.status(404).json({ error: "Invalid token" });
  
  // Prevent duplicate submissions
  if (participant.hasSubmitted) {
    return res.status(400).json({ error: "You have already submitted input for this meeting" });
  }
  
  // Update participant name if provided
  if (parse.data.name) {
    db.prepare("UPDATE participants SET email = ? WHERE id = ?").run(parse.data.name, participant.id);
  }
  
  const input = submitParticipantInput(participant.id, parse.data.content);
  broadcastStatus(participant.meetingId, "awaiting_inputs");

  // If all submitted, kick off persona generation
  if (haveAllSubmitted(participant.meetingId)) {
    const meeting = getMeeting(participant.meetingId);
    await ensurePersonasForMeeting(meeting);
    // Move to running state automatically
    db.prepare("UPDATE meetings SET status = 'running' WHERE id = ?").run(meeting.id);
    broadcastStatus(meeting.id, "running");
  }

  res.json({ ok: true, inputId: input.id });
});

// Participant message injection
const ParticipantInjectSchema = z.object({ 
  token: z.string(), 
  message: z.string().min(1) 
});
app.post("/api/participant/inject", (req, res) => {
  const parse = ParticipantInjectSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.message });
  
  const participant = getParticipantByToken(parse.data.token);
  if (!participant) return res.status(404).json({ error: "Invalid token" });
  
  const meeting = getMeeting(participant.meetingId);
  
  // Human interjections from participants should be labeled as Human with their email
  const speaker = `Human:${participant.email}`;
  console.log(`[Routes] Human interjection from participant: ${participant.email}`);
  
  const turn = appendTurn(participant.meetingId, speaker, parse.data.message);
  broadcastTurn(participant.meetingId, turn);
  
  // If meeting was paused (waiting for human input), resume it automatically
  if (meeting.status === "paused") {
    console.log(`[Routes] Meeting ${participant.meetingId} was paused - resuming after human input`);
    db.prepare("UPDATE meetings SET status = ? WHERE id = ?").run("running", participant.meetingId);
    broadcastStatus(participant.meetingId, "running");
  }
  
  res.json({ ok: true });
});

// Get conversation status
app.get("/api/meetings/:id/status", (req, res) => {
  const meeting = getMeeting(req.params.id);
  const history = getHistory(meeting.id);
  res.json({ status: meeting.status, whiteboard: meeting.whiteboard, history });
});

// Host controls: pause/resume
app.post("/api/meetings/:id/pause", requireHost, (req, res) => {
  const meeting = getMeeting(req.params.id);
  if (meeting.status === "paused") return res.json({ status: meeting.status });
  db.prepare("UPDATE meetings SET status = 'paused' WHERE id = ?").run(meeting.id);
  broadcastStatus(meeting.id, "paused");
  res.json({ status: "paused" });
});

app.post("/api/meetings/:id/resume", requireHost, (req, res) => {
  const meeting = getMeeting(req.params.id);
  if (meeting.status !== "paused") return res.json({ status: meeting.status });
  db.prepare("UPDATE meetings SET status = 'running' WHERE id = ?").run(meeting.id);
  broadcastStatus(meeting.id, "running");
  res.json({ status: "running" });
});

// Inject message
const InjectSchema = z.object({ author: z.string(), message: z.string().min(1) });
app.post("/api/meetings/:id/inject", (req, res) => {
  const parse = InjectSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.message });
  
  const meeting = getMeeting(req.params.id);
  
  // Find the participant by email/name
  const participant = db.prepare(
    "SELECT id FROM participants WHERE meetingId = ? AND email = ?"
  ).get(req.params.id, parse.data.author) as { id: string } | undefined;
  
  let speaker: string;
  
  if (participant) {
    // Human interjections from participants should be labeled as Human with their name
    speaker = `Human:${parse.data.author}`;
    console.log(`[Routes] Human interjection from participant: ${parse.data.author}`);
  } else {
    // Could be the host injecting
    console.log(`[Routes] Participant not found for ${parse.data.author}, treating as host interjection`);
    speaker = `Human:Host`; // Host interjections stay as Human:Host
  }
  
  const turn = appendTurn(req.params.id, speaker, parse.data.message);
  broadcastTurn(req.params.id, turn);
  
  // If meeting was paused (waiting for human input), resume it automatically
  if (meeting.status === "paused") {
    console.log(`[Routes] Meeting ${req.params.id} was paused - resuming after human input`);
    db.prepare("UPDATE meetings SET status = ? WHERE id = ?").run("running", req.params.id);
    broadcastStatus(req.params.id, "running");
  }
  
  res.json({ ok: true });
});

// Advance one AI turn (polled by frontend or via cron)
app.post("/api/meetings/:id/advance", requireHost, async (req, res) => {
  const meeting = getMeeting(req.params.id);
  if (meeting.status === "paused" || meeting.status === "completed") return res.json({ skipped: true });
  const result = await runOneTurn(meeting, []);
  const conclude = await attemptConclusion(meeting);
  if (conclude.conclude) {
    const report = await generateFinalReport(meeting);
    return res.json({ concluded: true, report });
  }
  res.json({ ...result });
});

// Get all meetings
app.get("/api/meetings", requireHost, (req, res) => {
  const meetings = db.prepare("SELECT id, subject, details, status, createdAt FROM meetings ORDER BY createdAt DESC").all() as any[];
  
  // Add participant count and submission status for each meeting
  const meetingsWithParticipants = meetings.map((meeting: any) => {
    const participants = db.prepare("SELECT id, email, hasSubmitted FROM participants WHERE meetingId = ?").all(meeting.id);
    return {
      ...meeting,
      participants: participants || []
    };
  });
  
  res.json(meetingsWithParticipants);
});

// Get single meeting
app.get("/api/meetings/:id", requireHost, (req, res) => {
  const meeting = getMeeting(req.params.id);
  res.json(meeting);
});

// Get conversation history
app.get("/api/meetings/:id/conversation", (req, res) => {
  const history = getHistory(req.params.id);
  res.json(history);
});

// Get whiteboard data
app.get("/api/meetings/:id/whiteboard", (req, res) => {
  const meeting = getMeeting(req.params.id);
  res.json(meeting.whiteboard);
});

// Start meeting
app.post("/api/meetings/:id/start", requireHost, (req, res) => {
  const meeting = getMeeting(req.params.id);
  if (meeting.status === "completed") return res.status(400).json({ error: "Meeting already completed" });
  
  // Only start if all participants have submitted
  if (!haveAllSubmitted(meeting.id)) {
    return res.status(400).json({ error: "Not all participants have submitted input" });
  }
  
  // Set to running
  db.prepare("UPDATE meetings SET status = 'running' WHERE id = ?").run(meeting.id);
  broadcastStatus(meeting.id, "running");
  
  res.json({ success: true });
});

// Get report if exists
app.get("/api/meetings/:id/report", (req, res) => {
  const row = db.prepare("SELECT * FROM reports WHERE meetingId = ?").get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: "Report not ready" });
  
  // Also fetch the conversation transcript
  const conversation = getHistory(req.params.id);
  
  // Get meeting details for subject and date
  const meeting = getMeeting(req.params.id);
  
  res.json({
    id: row.id,
    meetingId: row.meetingId,
    subject: meeting.subject,
    date: new Date(meeting.createdAt).toISOString(),
    executiveSummary: row.summary,
    highlights: JSON.parse(row.highlights),
    decisions: JSON.parse(row.decisions),
    actionItems: JSON.parse(row.actionItems),
    visualMap: JSON.parse(row.visualMap),
    transcript: conversation,
    createdAt: row.createdAt
  });
});
