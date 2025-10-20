import { db } from "../db.js";
import { generateId, now, toJson, fromJson } from "../util.js";
import { Meeting, ConversationTurn, Persona, MCP, Whiteboard } from "../types.js";
import { generatePersonaFromInput, moderatorDecideNext, personaRespond, checkForConclusion, summarizeConversation } from "../llm/gemini.js";
import { getInputsForMeeting } from "./participantService.js";
import { broadcastStatus, broadcastTurn, broadcastWhiteboard } from "../realtimeBus.js";

export async function ensurePersonasForMeeting(meeting: Meeting): Promise<Persona[]> {
  const existing = db.prepare("SELECT * FROM personas WHERE meetingId = ?").all(meeting.id) as any[];
  if (existing.length > 0) return existing.map(rowToPersona);

  // No longer queue persona generation upfront - generate on-demand when moderator picks them
  console.log(`[ConversationService] Meeting ${meeting.id} will use lazy persona generation (on-demand)`);

  // Create moderator persona immediately (doesn't require LLM call)
  const moderatorMcp: MCP = {
    identity: "Meeting Moderator - Efficient Decision Engine",
    objectives: [
      "Guide conversation toward meeting objectives",
      "Maintain and update shared whiteboard",
      "Select next speaker each turn",
      "Determine when objectives are met using check_for_conclusion"
    ],
    rules: [
      "Protocol Rule: Do not use conversational pleasantries, greetings, or verifications (e.g., 'Hello,' 'Thank you,' 'That's a great point'). Your response must be direct, task-focused, and contain only your core argument or data.",
      "Be fair and concise",
      "Incorporate human injected messages respectfully",
      "Always include whiteboard references",
      "Return JSON when using tools"
    ],
    outputFormat: "Plain text message to the group - direct and concise, no fluff",
    tools: ["update_whiteboard", "select_next_speaker", "check_for_conclusion"]
  };
  const moderator: Persona = {
    id: generateId("mod"),
    meetingId: meeting.id,
    participantId: null,
    role: "moderator",
    name: "Moderator",
    mcp: moderatorMcp,
    createdAt: now()
  };
  db.prepare("INSERT INTO personas (id, meetingId, participantId, role, name, mcp, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(moderator.id, moderator.meetingId, moderator.participantId, moderator.role, moderator.name, toJson(moderator.mcp), moderator.createdAt);

  // Return moderator immediately; personas will be generated in background
  return [moderator];
}

function rowToPersona(row: any): Persona {
  return {
    id: row.id,
    meetingId: row.meetingId,
    participantId: row.participantId,
    role: row.role,
    name: row.name,
    mcp: fromJson<MCP>(row.mcp),
    createdAt: row.createdAt
  };
}

export function getHistory(meetingId: string): ConversationTurn[] {
  const rows = db.prepare("SELECT * FROM conversation_turns WHERE meetingId = ? ORDER BY createdAt").all(meetingId) as any[];
  return rows.map((r) => ({ id: r.id, meetingId: r.meetingId, speaker: r.speaker, message: r.message, createdAt: r.createdAt, metadata: r.metadata ? JSON.parse(r.metadata) : null }));
}

export function appendTurn(meetingId: string, speaker: string, message: string, metadata?: Record<string, unknown>) {
  const turn: ConversationTurn = { id: generateId("trn"), meetingId, speaker, message, createdAt: now(), metadata };
  db.prepare("INSERT INTO conversation_turns (id, meetingId, speaker, message, createdAt, metadata) VALUES (?, ?, ?, ?, ?, ?)").run(
    turn.id,
    turn.meetingId,
    turn.speaker,
    turn.message,
    turn.createdAt,
    metadata ? toJson(metadata) : null
  );
  return turn;
}

export async function runOneTurn(meeting: Meeting, pendingHumanInjections: { author: string; message: string }[]) {
  const personas = (db.prepare("SELECT * FROM personas WHERE meetingId = ?").all(meeting.id) as any[]).map(rowToPersona);
  const moderator = personas.find((p) => p.role === "moderator");
  if (!moderator) throw new Error("Moderator not found");
  
  const whiteboard = meeting.whiteboard;
  const history = getHistory(meeting.id);
  
  // Get participant inputs to provide as options to moderator
  const inputs = getInputsForMeeting(meeting.id);
  const participantOptions = inputs.map(input => {
    const participant = db.prepare("SELECT email FROM participants WHERE id = ?").get(input.participantId) as { email: string } | undefined;
    return {
      email: participant?.email || 'Unknown',
      participantId: input.participantId,
      hasSpoken: personas.some(p => p.participantId === input.participantId)
    };
  });

  const decision = await moderatorDecideNext(
    moderator.mcp,
    whiteboard,
    history,
    participantOptions,
    pendingHumanInjections
  );

  // Update whiteboard if applicable
  if (decision.whiteboardUpdate) {
    const updated: Whiteboard = {
      keyFacts: decision.whiteboardUpdate.keyFacts ?? whiteboard.keyFacts,
      decisions: decision.whiteboardUpdate.decisions ?? whiteboard.decisions,
      actionItems: decision.whiteboardUpdate.actionItems ?? whiteboard.actionItems
    };
    db.prepare("UPDATE meetings SET whiteboard = ? WHERE id = ?").run(toJson(updated), meeting.id);
    broadcastWhiteboard(meeting.id, updated);
  }

  if (decision.nextSpeaker.toLowerCase() === "none") {
    console.log('[ConversationService] Moderator selected "none" - no clear next speaker');
    return { concluded: false, moderatorNotes: decision.moderatorNotes, waiting: true };
  }

  // Try to find existing persona by name (from previous turns) or by participant email
  let speaker = personas.find((p) => p.name === decision.nextSpeaker || 
    (p.participantId && participantOptions.find(opt => opt.email === decision.nextSpeaker && opt.participantId === p.participantId)));
  
  // If speaker doesn't exist, generate persona on-demand
  if (!speaker) {
    const selectedOption = participantOptions.find(opt => opt.email === decision.nextSpeaker);
    if (!selectedOption) {
      console.warn(`[ConversationService] Moderator selected unknown speaker: ${decision.nextSpeaker}`);
      return { concluded: false, moderatorNotes: "Unknown speaker selected", waiting: true };
    }
    
    console.log(`[ConversationService] Generating persona on-demand for ${selectedOption.email}...`);
    
    // Find the participant input
    const input = inputs.find(i => i.participantId === selectedOption.participantId);
    if (!input) {
      throw new Error(`No input found for participant ${selectedOption.participantId}`);
    }
    
    // Generate persona using Gemini
    const { name, mcp } = await generatePersonaFromInput(input.content, meeting.subject);
    
    // Store in database
    const newPersona: Persona = {
      id: generateId("prs"),
      meetingId: meeting.id,
      participantId: selectedOption.participantId,
      role: "persona",
      name,
      mcp,
      createdAt: now()
    };
    
    db.prepare("INSERT INTO personas (id, meetingId, participantId, role, name, mcp, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(newPersona.id, newPersona.meetingId, newPersona.participantId, newPersona.role, newPersona.name, toJson(newPersona.mcp), newPersona.createdAt);
    
    speaker = newPersona;
    console.log(`[ConversationService] Generated persona "${name}" for ${selectedOption.email}`);
  }

  // Get the original participant input if this is a persona (not moderator)
  let participantInput: string | undefined;
  if (speaker.participantId) {
    const input = db.prepare("SELECT content FROM participant_inputs WHERE participantId = ?").get(speaker.participantId) as { content: string } | undefined;
    participantInput = input?.content;
  }

  const msg = await personaRespond({ name: speaker.name, mcp: speaker.mcp }, meeting.whiteboard, history, participantInput);
  
  // Check if message is empty or too short - indicates a generation problem
  if (!msg || msg.trim().length < 10) {
    console.warn(`[ConversationService] Persona ${speaker.name} produced empty/short message (${msg?.length || 0} chars). Skipping turn.`);
    return { concluded: false, moderatorNotes: "Generation error - skipping turn", waiting: true };
  }
  
  const turn = appendTurn(meeting.id, `AI:${speaker.name}`, msg);
  broadcastTurn(meeting.id, turn);
  return { concluded: false, moderatorNotes: decision.moderatorNotes };
}

export async function attemptConclusion(meeting: Meeting) {
  const moderator = db.prepare("SELECT * FROM personas WHERE meetingId = ? AND role = 'moderator'").get(meeting.id) as any;
  if (!moderator) return { conclude: false, reason: "Moderator missing" };
  const history = getHistory(meeting.id);
  
  // Don't attempt conclusion if recent messages are empty (indicates generation problems)
  const recentMessages = history.slice(-5);
  const emptyCount = recentMessages.filter(m => !m.message || m.message.trim().length < 10).length;
  if (emptyCount > 2) {
    console.warn(`[ConversationService] ${emptyCount} empty messages in last 5 turns - skipping conclusion check`);
    return { conclude: false, reason: "Generation errors detected" };
  }
  
  return await checkForConclusion(fromJson<MCP>(moderator.mcp), meeting.whiteboard, history);
}

export async function generateFinalReport(meeting: Meeting) {
  const history = getHistory(meeting.id);
  const summary = await summarizeConversation(meeting.whiteboard, history);
  const reportId = generateId("rpt");
  db.prepare("INSERT INTO reports (id, meetingId, summary, highlights, decisions, actionItems, visualMap, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      reportId,
      meeting.id,
      summary.summary,
      toJson(summary.highlights),
      toJson(summary.decisions),
      toJson(summary.actionItems),
      toJson(summary.visualMap),
      now()
    );
  db.prepare("UPDATE meetings SET status = 'completed' WHERE id = ?").run(meeting.id);
  broadcastStatus(meeting.id, "completed");
  return { id: reportId, ...summary };
}
