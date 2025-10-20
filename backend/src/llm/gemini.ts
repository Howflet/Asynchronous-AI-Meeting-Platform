import { GoogleGenerativeAI } from "@google/generative-ai";
import { MCP, Whiteboard, ConversationTurn, ConversationGraph } from "../types.js";
import { GeminiRateLimiter } from "./rateLimiter.js";
import { 
  estimateInputTokens, 
  estimateOutputTokens, 
  getMaxOutputTokens,
  extractTokenUsage,
  logTokenUsage,
  calculateTotalEstimate 
} from "./tokenEstimator.js";
import { withRetry, GEMINI_RETRY_CONFIG } from "./retryHandler.js";

// This is a thin wrapper around Gemini calls used across services.
// It centralizes prompt construction to honor the SRS constraint that all LLM ops go through Gemini.

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Initialize rate limiter with Google AI Studio free tier limits
// RPM: 10, TPM: 250,000, RDP: 250
const rateLimiter = new GeminiRateLimiter({
  requestsPerMinute: 10,
  tokensPerMinute: 250_000,
  requestsPerDay: 250,
});

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Extract JSON from Gemini response (handles markdown code blocks)
 */
function extractJson(text: string): any {
  if (!text || text.trim().length === 0) {
    throw new Error("Empty response text");
  }
  
  let jsonText = text.trim();
  
  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Try to find JSON object with balanced braces
  const openBrace = jsonText.indexOf('{');
  if (openBrace === -1) {
    throw new Error(`No opening brace found in response (length: ${text.length})`);
  }
  
  // Find matching closing brace
  let depth = 0;
  let closeBrace = -1;
  for (let i = openBrace; i < jsonText.length; i++) {
    if (jsonText[i] === '{') depth++;
    if (jsonText[i] === '}') {
      depth--;
      if (depth === 0) {
        closeBrace = i;
        break;
      }
    }
  }
  
  if (closeBrace === -1 || depth !== 0) {
    throw new Error(`Incomplete JSON object in response (length: ${text.length}, depth: ${depth})`);
  }
  
  const jsonString = jsonText.substring(openBrace, closeBrace + 1);
  
  try {
    return JSON.parse(jsonString);
  } catch (parseError: any) {
    throw new Error(`JSON parse error: ${parseError.message}. JSON string: ${jsonString.substring(0, 100)}...`);
  }
}

/**
 * Get rate limiter status
 */
export function getRateLimiterStatus() {
  return rateLimiter.getStatus();
}

export async function generatePersonaFromInput(
  input: string,
  meetingSubject: string
): Promise<{ name: string; mcp: MCP }> {
  const system = `You are to produce a JSON object for an AI Persona's Model Contextual Protocol (MCP). 
IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.
Keep descriptions brief (under 30 words each). Limit to 3-4 objectives and 3-4 rules.`;
  
  const user = `Meeting Subject: ${meetingSubject}
Participant Input: ${input}

Generate a persona for an efficient decision-making meeting.

CRITICAL: First rule must be:
"Do not use pleasantries or greetings. Be direct and task-focused."

Return ONLY this JSON (no markdown, keep it concise):
{
  "name": "PersonaName",
  "mcp": {
    "identity": "Brief description (under 30 words)",
    "objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "rules": [
      "Do not use pleasantries or greetings. Be direct and task-focused.",
      "Rule 2",
      "Rule 3"
    ],
    "outputFormat": "Concise and direct"
  }
}`;
  
  // Estimate tokens
  const estimatedInput = estimateInputTokens(system, user);
  const estimatedOutput = estimateOutputTokens('json');
  const totalEstimated = calculateTotalEstimate(estimatedInput, estimatedOutput);
  
  // Schedule with rate limiter and retry logic
  return await rateLimiter.scheduleRequest(
    async () => {
      return await withRetry(
        async () => {
          const genAI = getClient();
          const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODEL,
            generationConfig: {
              maxOutputTokens: 2000, // Increased for consistency
              temperature: 0.7,
              responseMimeType: "application/json", // Force JSON output
            }
          });
          
          const resp = await model.generateContent({ 
            contents: [{ role: "user", parts: [{ text: system + "\n\n" + user }] }] 
          });
          
          // Check if response is complete
          if (!resp.response || !resp.response.candidates || resp.response.candidates.length === 0) {
            throw new Error('Empty or incomplete response from Gemini API');
          }
          
          // Check for safety blocks or truncation
          const candidate = resp.response.candidates[0];
          if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            console.warn('[Gemini] generatePersonaFromInput unusual finish reason:', candidate.finishReason);
            if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
              throw new Error(`Response blocked by ${candidate.finishReason} filter`);
            }
            if (candidate.finishReason === 'MAX_TOKENS') {
              console.warn('[Gemini] Persona response truncated due to MAX_TOKENS');
            }
          }
          
          // Extract actual usage and reconcile
          const actualUsage = extractTokenUsage(resp);
          if (actualUsage) {
            rateLimiter.reconcileUsage(totalEstimated, actualUsage.totalTokens);
            logTokenUsage(
              'generatePersonaFromInput',
              { input: estimatedInput, output: estimatedOutput, total: totalEstimated },
              actualUsage
            );
          }
          
          const text = resp.response.text().trim();
          console.log('[Gemini] generatePersonaFromInput raw response length:', text.length, 'chars');
          console.log('[Gemini] generatePersonaFromInput raw response:', text);
          
          // Check for empty or truncated response
          if (!text || text.length < 50) {
            throw new Error(`Response too short or empty (${text.length} chars): ${text}`);
          }
          
          try {
            const parsed = extractJson(text);
            
            // Validate the structure
            if (!parsed.name || typeof parsed.name !== 'string') {
              throw new Error('Missing or invalid "name" field');
            }
            if (!parsed.mcp || typeof parsed.mcp !== 'object') {
              throw new Error('Missing or invalid "mcp" field');
            }
            if (!parsed.mcp.identity || !Array.isArray(parsed.mcp.objectives) || !Array.isArray(parsed.mcp.rules) || !parsed.mcp.outputFormat) {
              throw new Error('Invalid MCP structure - missing required fields');
            }
            
            return { name: parsed.name, mcp: parsed.mcp as MCP };
          } catch (parseError: any) {
            console.error('[Gemini] generatePersonaFromInput parse error:', parseError.message);
            console.error('[Gemini] Raw text:', text);
            throw new Error(`Failed to parse persona MCP JSON: ${parseError.message}`);
          }
        },
        'generatePersonaFromInput',
        GEMINI_RETRY_CONFIG
      );
    },
    totalEstimated,
    1 // High priority for persona generation
  );
}

export async function moderatorDecideNext(
  moderatorMcp: MCP,
  whiteboard: Whiteboard,
  history: ConversationTurn[],
  participantOptions: { email: string; participantId: string; hasSpoken: boolean }[],
  pendingHumanInjections: { author: string; message: string }[]
): Promise<{ nextSpeaker: string; moderatorNotes: string; whiteboardUpdate?: Partial<Whiteboard> }>
{
  // Ultra-minimal prompt - just last 2 turns
  const recentHistory = history.slice(-2);
  const speakerOptions = participantOptions.map(p => p.email);
  
  const user = `Participants: ${speakerOptions.join(', ')}
Last turns: ${recentHistory.map(t => `${t.speaker}: ${t.message.substring(0, 60)}`).join(' | ')}

Pick next speaker (email or "none"). Return JSON: {"nextSpeaker":"email","moderatorNotes":"brief"}`;
  
  // Estimate tokens
  const estimatedInput = estimateInputTokens('', user);
  const estimatedOutput = estimateOutputTokens('json');
  const totalEstimated = calculateTotalEstimate(estimatedInput, estimatedOutput);
  
  return await rateLimiter.scheduleRequest(
    async () => {
      return await withRetry(
        async () => {
          const genAI = getClient();
          const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODEL,
            generationConfig: {
              maxOutputTokens: 2000, // Increased to match personaRespond
              temperature: 0.8,
              responseMimeType: "application/json",
            }
          });
          
          const resp = await model.generateContent({ 
            contents: [{ role: "user", parts: [{ text: user }] }] 
          });
          
          // Check if response is complete
          if (!resp.response || !resp.response.candidates || resp.response.candidates.length === 0) {
            throw new Error('Empty or incomplete response from Gemini API');
          }
          
          // Check for safety blocks or truncation
          const candidate = resp.response.candidates[0];
          if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            console.warn('[Gemini] moderatorDecideNext unusual finish reason:', candidate.finishReason);
            if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
              throw new Error(`Response blocked by ${candidate.finishReason} filter`);
            }
            if (candidate.finishReason === 'MAX_TOKENS') {
              console.warn('[Gemini] Moderator response truncated due to MAX_TOKENS');
            }
          }
          
          const actualUsage = extractTokenUsage(resp);
          if (actualUsage) {
            rateLimiter.reconcileUsage(totalEstimated, actualUsage.totalTokens);
            logTokenUsage(
              'moderatorDecideNext',
              { input: estimatedInput, output: estimatedOutput, total: totalEstimated },
              actualUsage
            );
          }
          
          const text = resp.response.text().trim();
          console.log('[Gemini] moderatorDecideNext raw response length:', text.length, 'chars');
          console.log('[Gemini] moderatorDecideNext raw response:', text);
          
          // Check for empty or truncated response
          if (!text || text.length < 20) {
            throw new Error(`Response too short or empty (${text.length} chars): "${text}"`);
          }
          
          try {
            const parsed = extractJson(text);
            
            // Validate structure
            if (!parsed.nextSpeaker || typeof parsed.nextSpeaker !== 'string') {
              throw new Error('Missing or invalid "nextSpeaker" field');
            }
            if (!parsed.moderatorNotes || typeof parsed.moderatorNotes !== 'string') {
              throw new Error('Missing or invalid "moderatorNotes" field');
            }
            
            return parsed;
          } catch (parseError: any) {
            console.error('[Gemini] moderatorDecideNext parse error:', parseError.message);
            console.error('[Gemini] Raw text:', text);
            throw new Error(`Failed to parse moderator decision JSON: ${parseError.message}`);
          }
        },
        'moderatorDecideNext',
        GEMINI_RETRY_CONFIG
      );
    },
    totalEstimated,
    2 // Normal priority
  );
}

export async function personaRespond(
  persona: { name: string; mcp: MCP },
  whiteboard: Whiteboard,
  history: ConversationTurn[],
  participantInput?: string
): Promise<string> {
  // Ultra-minimal prompt to avoid MAX_TOKENS
  const recentHistory = history.slice(-3); // Only last 3 turns instead of 6
  
  const prompt = `You: ${persona.name}
Identity: ${persona.mcp.identity.substring(0, 100)}
${participantInput ? `Your input: "${participantInput.substring(0, 150)}"` : ''}

Last 3 turns: ${recentHistory.map(t => `${t.speaker}: ${t.message.substring(0, 60)}`).join(' | ')}

Rules: Be direct, no pleasantries. Max 80 words. State your position or data.`;
  
  // Estimate tokens
  const estimatedInput = estimateInputTokens('', prompt);
  const estimatedOutput = estimateOutputTokens('medium');
  const totalEstimated = calculateTotalEstimate(estimatedInput, estimatedOutput);
  
  return await rateLimiter.scheduleRequest(
    async () => {
      return await withRetry(
        async () => {
          const genAI = getClient();
          const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODEL,
            generationConfig: {
              maxOutputTokens: 2000, // Increased to ensure room for persona responses
              temperature: 0.9,
            }
          });
          
          const resp = await model.generateContent({ 
            contents: [{ role: "user", parts: [{ text: prompt }] }] 
          });
          
          // Check if response is complete
          if (!resp.response || !resp.response.candidates || resp.response.candidates.length === 0) {
            throw new Error('Empty or incomplete response from Gemini API');
          }
          
          // Check for safety blocks or truncation
          const candidate = resp.response.candidates[0];
          if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            console.warn('[Gemini] personaRespond unusual finish reason:', candidate.finishReason);
            if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
              throw new Error(`Response blocked by ${candidate.finishReason} filter`);
            }
            if (candidate.finishReason === 'MAX_TOKENS') {
              console.warn('[Gemini] Persona response truncated due to MAX_TOKENS');
            }
          }
          
          const actualUsage = extractTokenUsage(resp);
          if (actualUsage) {
            rateLimiter.reconcileUsage(totalEstimated, actualUsage.totalTokens);
            logTokenUsage(
              'personaRespond',
              { input: estimatedInput, output: estimatedOutput, total: totalEstimated },
              actualUsage
            );
          }
          
          const text = resp.response.text().trim();
          console.log('[Gemini] personaRespond raw response length:', text.length, 'chars');
          console.log('[Gemini] personaRespond raw response:', text.substring(0, 200));
          
          // Check for empty response
          if (!text || text.length === 0) {
            throw new Error('personaRespond returned empty response');
          }
          
          return text;
        },
        'personaRespond',
        GEMINI_RETRY_CONFIG
      );
    },
    totalEstimated,
    2 // Normal priority
  );
}

export async function checkForConclusion(
  moderatorMcp: MCP,
  whiteboard: Whiteboard,
  history: ConversationTurn[]
): Promise<{ conclude: boolean; reason: string }>
{
  const system = `You are analyzing whether a meeting has reached its conclusion.
IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.
Keep your reason under 50 words.`;
  
  // Truncate history to just last 3 turns to reduce input tokens
  const recentHistory = history.slice(-3);
  
  const user = `Check if meeting objectives are met.
MCP Objectives: ${JSON.stringify(moderatorMcp.objectives || [])}
Whiteboard Key Facts: ${JSON.stringify(whiteboard.keyFacts?.slice(0, 5) || [])}
Whiteboard Decisions: ${JSON.stringify(whiteboard.decisions?.slice(0, 5) || [])}
Recent Turns: ${recentHistory.length}

Return ONLY this JSON structure (no markdown):
{ "conclude": boolean, "reason": "brief explanation under 50 words" }`;
  
  // Estimate tokens
  const estimatedInput = estimateInputTokens(system, user);
  const estimatedOutput = estimateOutputTokens('short');
  const totalEstimated = calculateTotalEstimate(estimatedInput, estimatedOutput);
  
  return await rateLimiter.scheduleRequest(
    async () => {
      return await withRetry(
        async () => {
          const genAI = getClient();
          const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODEL,
            generationConfig: {
              maxOutputTokens: 2000, // Increased for consistency
              temperature: 0.5,
              responseMimeType: "application/json",
            }
          });
          
          const resp = await model.generateContent({ 
            contents: [{ role: "user", parts: [{ text: system + "\n\n" + user }] }] 
          });
          
          // Check if response is complete
          if (!resp.response || !resp.response.candidates || resp.response.candidates.length === 0) {
            throw new Error('Empty or incomplete response from Gemini API');
          }
          
          // Check for safety blocks or other issues
          const candidate = resp.response.candidates[0];
          if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            console.warn('[Gemini] checkForConclusion unusual finish reason:', candidate.finishReason);
            if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
              throw new Error(`Response blocked by ${candidate.finishReason} filter`);
            }
            if (candidate.finishReason === 'MAX_TOKENS') {
              console.warn('[Gemini] Response truncated due to MAX_TOKENS');
            }
          }
          
          const actualUsage = extractTokenUsage(resp);
          if (actualUsage) {
            rateLimiter.reconcileUsage(totalEstimated, actualUsage.totalTokens);
            logTokenUsage(
              'checkForConclusion',
              { input: estimatedInput, output: estimatedOutput, total: totalEstimated },
              actualUsage
            );
          }
          
          const text = resp.response.text().trim();
          console.log('[Gemini] checkForConclusion raw response length:', text.length, 'chars');
          console.log('[Gemini] checkForConclusion raw response:', text);
          
          // Check for empty or truncated response
          if (!text || text.length < 10) {
            throw new Error(`Response too short or empty (${text.length} chars): ${text}`);
          }
          
          try {
            const parsed = extractJson(text);
            
            // Validate structure
            if (typeof parsed.conclude !== 'boolean') {
              throw new Error('Missing or invalid "conclude" field');
            }
            if (!parsed.reason || typeof parsed.reason !== 'string') {
              throw new Error('Missing or invalid "reason" field');
            }
            
            return { conclude: parsed.conclude, reason: parsed.reason };
          } catch (parseError: any) {
            console.error('[Gemini] checkForConclusion parse error:', parseError.message);
            console.error('[Gemini] Raw text:', text);
            throw new Error(`Failed to parse conclusion JSON: ${parseError.message}`);
          }
        },
        'checkForConclusion',
        GEMINI_RETRY_CONFIG
      );
    },
    totalEstimated,
    3 // Lower priority
  );
}

export async function summarizeConversation(
  whiteboard: Whiteboard,
  history: ConversationTurn[]
): Promise<{ summary: string; highlights: string[]; decisions: string[]; actionItems: string[]; visualMap: ConversationGraph }>
{
  const system = `You are creating a comprehensive meeting summary.
IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.`;
  
  const user = `Create a meeting summary based on:
Whiteboard: ${JSON.stringify(whiteboard)}
Conversation History: ${JSON.stringify(history)}

Return ONLY this JSON structure (no markdown):
{
  "summary": "Brief summary in 200 words",
  "highlights": ["Key point 1", "Key point 2"],
  "decisions": ["Decision 1", "Decision 2"],
  "actionItems": ["Action 1", "Action 2"],
  "visualMap": {
    "nodes": [{"id": "node1", "label": "Label"}],
    "edges": [{"from": "node1", "to": "node2"}]
  }
}`;
  
  // Estimate tokens
  const estimatedInput = estimateInputTokens(system, user);
  const estimatedOutput = estimateOutputTokens('long');
  const totalEstimated = calculateTotalEstimate(estimatedInput, estimatedOutput);
  
  return await rateLimiter.scheduleRequest(
    async () => {
      return await withRetry(
        async () => {
          const genAI = getClient();
          const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODEL,
            generationConfig: {
              maxOutputTokens: getMaxOutputTokens('long'),
              temperature: 0.6,
              responseMimeType: "application/json",
            }
          });
          
          const resp = await model.generateContent({ 
            contents: [{ role: "user", parts: [{ text: system + "\n\n" + user }] }] 
          });
          
          const actualUsage = extractTokenUsage(resp);
          if (actualUsage) {
            rateLimiter.reconcileUsage(totalEstimated, actualUsage.totalTokens);
            logTokenUsage(
              'summarizeConversation',
              { input: estimatedInput, output: estimatedOutput, total: totalEstimated },
              actualUsage
            );
          }
          
          const text = resp.response.text().trim();
          console.log('[Gemini] summarizeConversation raw response:', text.substring(0, 200));
          
          try {
            const parsed = extractJson(text);
            
            // Validate structure
            if (!parsed.summary || typeof parsed.summary !== 'string') {
              throw new Error('Missing or invalid "summary" field');
            }
            if (!Array.isArray(parsed.highlights) || !Array.isArray(parsed.decisions) || !Array.isArray(parsed.actionItems)) {
              throw new Error('Missing or invalid array fields');
            }
            if (!parsed.visualMap || !Array.isArray(parsed.visualMap.nodes) || !Array.isArray(parsed.visualMap.edges)) {
              throw new Error('Missing or invalid "visualMap" field');
            }
            
            return parsed;
          } catch (parseError: any) {
            console.error('[Gemini] summarizeConversation parse error:', parseError.message);
            console.error('[Gemini] Raw text:', text);
            throw new Error(`Failed to parse summary JSON: ${parseError.message}`);
          }
        },
        'summarizeConversation',
        GEMINI_RETRY_CONFIG
      );
    },
    totalEstimated,
    0 // Highest priority for final report
  );
}
