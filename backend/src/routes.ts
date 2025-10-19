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

initDb();

export const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || ["*"], credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Health
app.get("/api/health", (_, res) => res.json({ ok: true }));

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

  // Send emails
  for (const p of meeting.participants) {
    const url = createParticipantUrl(participantBaseUrl, p.token);
    try {
      await sendInvitationEmail(p.email, meeting.subject, url);
    } catch (e) {
      console.error("Email error", e);
    }
  }

  res.json({ id: meeting.id, subject: meeting.subject, details: meeting.details, participants: meeting.participants.map(p => ({ id: p.id, email: p.email })) });
});

// Participant landing via token
app.get("/api/participant", (req, res) => {
  const token = String(req.query.token || "");
  if (!token) return res.status(400).json({ error: "Missing token" });
  const participant = getParticipantByToken(token);
  if (!participant) return res.status(404).json({ error: "Invalid link" });
  res.json({ id: participant.id, meetingId: participant.meetingId, email: participant.email, hasSubmitted: participant.hasSubmitted, subject: participant.meetingSubject, details: participant.meetingDetails });
});

// Submit participant input
const SubmitInputSchema = z.object({ token: z.string(), content: z.string().min(10) });
app.post("/api/participant/submit", async (req, res) => {
  const parse = SubmitInputSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.message });
  const participant = getParticipantByToken(parse.data.token);
  if (!participant) return res.status(404).json({ error: "Invalid token" });
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
  const turn = appendTurn(req.params.id, `Human:${parse.data.author}`, parse.data.message);
  broadcastTurn(req.params.id, turn);
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

// Get report if exists
app.get("/api/meetings/:id/report", (req, res) => {
  const row = db.prepare("SELECT * FROM reports WHERE meetingId = ?").get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: "Report not ready" });
  res.json({
    id: row.id,
    meetingId: row.meetingId,
    summary: row.summary,
    highlights: JSON.parse(row.highlights),
    decisions: JSON.parse(row.decisions),
    actionItems: JSON.parse(row.actionItems),
    visualMap: JSON.parse(row.visualMap),
    createdAt: row.createdAt
  });
});
