import { db } from "../db.js";
import { generateId, now, toJson, fromJson } from "../util.js";
import { Meeting, ConversationTurn, Persona, MCP, Whiteboard } from "../types.js";
import { generatePersonaFromInput, moderatorDecideNext, personaRespond, checkForConclusion, summarizeConversation } from "../llm/gemini.js";
import { getInputsForMeeting } from "./participantService.js";
import { broadcastStatus, broadcastTurn, broadcastWhiteboard } from "../realtimeBus.js";

export async function ensurePersonasForMeeting(meeting: Meeting): Promise<Persona[]> {
  const existing = db.prepare("SELECT * FROM personas WHERE meetingId = ?").all(meeting.id) as any[];
  if (existing.length > 0) return existing.map(rowToPersona);

  // Create personas for each participant from their input
  const inputs = getInputsForMeeting(meeting.id);
  const personas: Persona[] = [];
  for (const inp of inputs) {
    const { name, mcp } = await generatePersonaFromInput(inp.content, meeting.subject);
    const persona: Persona = {
      id: generateId("per"),
      meetingId: meeting.id,
      participantId: inp.participantId,
      role: "persona",
      name,
      mcp,
      createdAt: now()
    };
    db.prepare("INSERT INTO personas (id, meetingId, participantId, role, name, mcp, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(persona.id, persona.meetingId, persona.participantId, persona.role, persona.name, toJson(persona.mcp), persona.createdAt);
    personas.push(persona);
  }

  // Create moderator persona with tools
  const moderatorMcp: MCP = {
    identity: "Meeting Moderator",
    objectives: [
      "Guide conversation toward meeting objectives",
      "Maintain and update shared whiteboard",
      "Select next speaker each turn",
      "Determine when objectives are met using check_for_conclusion"
    ],
    rules: [
      "Be fair and concise",
      "Incorporate human injected messages respectfully",
      "Always include whiteboard references",
      "Return JSON when using tools"
    ],
    outputFormat: "Plain text message to the group",
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

  return [...personas, moderator];
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

  const decision = await moderatorDecideNext(
    moderator.mcp,
    whiteboard,
    history,
    personas.filter((p) => p.role === "persona").map((p) => ({ name: p.name, mcp: p.mcp })),
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
    return { concluded: true, moderatorNotes: decision.moderatorNotes };
  }

  const speaker = personas.find((p) => p.name === decision.nextSpeaker);
  if (!speaker) throw new Error(`Persona not found: ${decision.nextSpeaker}`);

  const msg = await personaRespond({ name: speaker.name, mcp: speaker.mcp }, meeting.whiteboard, history);
  const turn = appendTurn(meeting.id, `AI:${speaker.name}`, msg);
  broadcastTurn(meeting.id, turn);
  return { concluded: false, moderatorNotes: decision.moderatorNotes };
}

export async function attemptConclusion(meeting: Meeting) {
  const moderator = db.prepare("SELECT * FROM personas WHERE meetingId = ? AND role = 'moderator'").get(meeting.id) as any;
  if (!moderator) return { conclude: false, reason: "Moderator missing" };
  const history = getHistory(meeting.id);
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
