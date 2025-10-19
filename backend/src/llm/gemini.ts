import { GoogleGenerativeAI } from "@google/generative-ai";
import { MCP, Whiteboard, ConversationTurn, ConversationGraph } from "../types.js";

// This is a thin wrapper around Gemini calls used across services.
// It centralizes prompt construction to honor the SRS constraint that all LLM ops go through Gemini.

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenerativeAI(apiKey);
}

export async function generatePersonaFromInput(
  input: string,
  meetingSubject: string
): Promise<{ name: string; mcp: MCP }> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const system = `You are to produce a strict JSON for an AI Persona's Model Contextual Protocol (MCP).`;
  const user = `Meeting Subject: ${meetingSubject}\nParticipant Input: ${input}\n\nReturn JSON with keys: name, mcp { identity, objectives[], rules[], outputFormat }.`;
  const resp = await model.generateContent({ contents: [{ role: "user", parts: [{ text: system + "\n\n" + user }] }] });
  const text = resp.response.text();
  // Attempt to extract JSON
  const jsonMatch = text.match(/\{[\s\S]*\}$/);
  if (!jsonMatch) throw new Error("Failed to parse persona MCP JSON");
  const parsed = JSON.parse(jsonMatch[0]);
  return { name: parsed.name, mcp: parsed.mcp as MCP };
}

export async function moderatorDecideNext(
  moderatorMcp: MCP,
  whiteboard: Whiteboard,
  history: ConversationTurn[],
  personas: { name: string; mcp: MCP }[],
  pendingHumanInjections: { author: string; message: string }[]
): Promise<{ nextSpeaker: string; moderatorNotes: string; whiteboardUpdate?: Partial<Whiteboard> }>
{
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = `You are a Moderator following this MCP: ${JSON.stringify(moderatorMcp)}\nWhiteboard:${JSON.stringify(whiteboard)}\nHistory:${JSON.stringify(history)}\nPersonas:${JSON.stringify(personas)}\nHumanInjections:${JSON.stringify(pendingHumanInjections)}\n\nDecide the next speaker (choose one persona by name, or 'none' if concluding). Optionally propose whiteboard updates. Return strict JSON { nextSpeaker: string, moderatorNotes: string, whiteboardUpdate?: { keyFacts?: string[], decisions?: string[], actionItems?: string[] } }`;
  const resp = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
  const text = resp.response.text();
  const match = text.match(/\{[\s\S]*\}$/);
  if (!match) throw new Error("Failed to parse moderator decision JSON");
  return JSON.parse(match[0]);
}

export async function personaRespond(
  persona: { name: string; mcp: MCP },
  whiteboard: Whiteboard,
  history: ConversationTurn[]
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = `You are persona ${persona.name}. Follow your MCP: ${JSON.stringify(
    persona.mcp
  )}. Shared Whiteboard: ${JSON.stringify(whiteboard)}. Conversation History: ${JSON.stringify(history)}. Produce your turn.`;
  const resp = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
  return resp.response.text();
}

export async function checkForConclusion(
  moderatorMcp: MCP,
  whiteboard: Whiteboard,
  history: ConversationTurn[]
): Promise<{ conclude: boolean; reason: string }>
{
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = `Use your check_for_conclusion tool as guided in MCP: ${JSON.stringify(
    moderatorMcp
  )}. Consider Whiteboard and History. Answer JSON { conclude:boolean, reason:string }.`;
  const resp = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
  const text = resp.response.text();
  const match = text.match(/\{[\s\S]*\}$/);
  if (!match) throw new Error("Failed to parse conclusion JSON");
  return JSON.parse(match[0]);
}

export async function summarizeConversation(
  whiteboard: Whiteboard,
  history: ConversationTurn[]
): Promise<{ summary: string; highlights: string[]; decisions: string[]; actionItems: string[]; visualMap: ConversationGraph }>
{
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = `Create a meeting summary with sections: summary, highlights[], decisions[], actionItems[], and a simple node-edge visual map. Base it on Whiteboard ${JSON.stringify(
    whiteboard
  )} and History ${JSON.stringify(history)}. Return strict JSON with keys summary, highlights, decisions, actionItems, visualMap { nodes:[{id,label}], edges:[{from,to}] }`;
  const resp = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
  const text = resp.response.text();
  const match = text.match(/\{[\s\S]*\}$/);
  if (!match) throw new Error("Failed to parse summary JSON");
  return JSON.parse(match[0]);
}
