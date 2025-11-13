import type { Meeting, ConversationTurn, Participant, MeetingReport } from "./types"

// Use empty string to make all API calls relative to current origin (no CORS issues in monolithic container)
const API_URL = ""
const HOST_PASSWORD = process.env.NEXT_PUBLIC_HOST_PASSWORD || "12345"

// Authentication token management
let authToken: string | null = null

/**
 * Get authentication token (auto-login with HOST_PASSWORD)
 */
async function getAuthToken(): Promise<string> {
  if (authToken) return authToken

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: HOST_PASSWORD }),
  })

  if (!response.ok) {
    throw new Error("Authentication failed")
  }

  const data = await response.json()
  authToken = data.token

  if (!authToken) {
    throw new Error("No token received from server")
  }

  return authToken
}

/**
 * Make authenticated API call with Bearer token
 */
async function authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken()

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  // If 401 (token expired), clear token and retry once
  if (response.status === 401) {
    authToken = null
    const newToken = await getAuthToken()

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      },
    })
  }

  return response
}

/**
 * Make non-authenticated API call (for public endpoints)
 */
async function publicFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  })
}

// === AUTHENTICATED ENDPOINTS ===

/**
 * Create a new meeting (requires Bearer auth)
 * POST /api/meetings
 */
export async function createMeeting(
  subject: string,
  details: string,
  participants: Array<{ email: string; name?: string }>,
): Promise<{ 
  id: string; 
  subject: string; 
  details: string; 
  participants: Participant[]; 
  invitationLinks: Array<{ email: string; link: string }>;
}> {
  // Convert participants to array of emails for backend
  const participantEmails = participants.map(p => p.email);
  
  const response = await authenticatedFetch("/api/meetings", {
    method: "POST",
    body: JSON.stringify({ 
      subject, 
      details, 
      participants: participantEmails,
      participantBaseUrl: `${window.location.origin}/participate`
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to create meeting: ${errorText}`)
  }

  return response.json()
}

/**
 * Pause a running meeting (requires Bearer auth)
 * POST /api/meetings/:id/pause
 */
export async function pauseMeeting(id: string): Promise<{ success: boolean }> {
  const response = await authenticatedFetch(`/api/meetings/${id}/pause`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to pause meeting")
  }

  return response.json()
}

/**
 * Resume a paused meeting (requires Bearer auth)
 * POST /api/meetings/:id/resume
 */
export async function resumeMeeting(id: string): Promise<{ success: boolean }> {
  const response = await authenticatedFetch(`/api/meetings/${id}/resume`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to resume meeting")
  }

  return response.json()
}

/**
 * Advance meeting to next turn (requires Bearer auth)
 * POST /api/meetings/:id/advance
 */
export async function advanceMeeting(id: string): Promise<{ success: boolean }> {
  const response = await authenticatedFetch(`/api/meetings/${id}/advance`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to advance meeting")
  }

  return response.json()
}

/**
 * End meeting (manually conclude) (requires Bearer auth)
 * POST /api/meetings/:id/end
 */
export async function endMeeting(id: string): Promise<{ success: boolean }> {
  const response = await authenticatedFetch(`/api/meetings/${id}/end`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to end meeting")
  }

  return response.json()
}

/**
 * Delete meeting permanently (requires Bearer auth)
 * DELETE /api/meetings/:id
 */
export async function deleteMeeting(id: string): Promise<{ success: boolean }> {
  const response = await authenticatedFetch(`/api/meetings/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete meeting")
  }

  return response.json()
}

/**
 * Get system status (requires Bearer auth)
 * GET /api/system/status
 */
export async function getSystemStatus(): Promise<any> {
  const response = await authenticatedFetch("/api/system/status")

  if (!response.ok) {
    throw new Error("Failed to fetch system status")
  }

  return response.json()
}

/**
 * Get all meetings (requires Bearer auth)
 * GET /api/meetings
 */
export async function getMeetings(): Promise<Meeting[]> {
  const response = await authenticatedFetch("/api/meetings")

  if (!response.ok) {
    throw new Error("Failed to fetch meetings")
  }

  return response.json()
}

/**
 * Get a single meeting (requires Bearer auth)
 * GET /api/meetings/:id
 */
export async function getMeeting(id: string): Promise<Meeting> {
  const response = await authenticatedFetch(`/api/meetings/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch meeting")
  }

  return response.json()
}

// === PUBLIC ENDPOINTS ===

/**
 * Get meeting status with conversation and personas (public)
 * GET /api/meetings/:id/status
 */
export async function getMeetingStatus(id: string): Promise<{
  meeting: Meeting
  conversation: ConversationTurn[]
  personas: any[]
}> {
  const response = await publicFetch(`/api/meetings/${id}/status`)

  if (!response.ok) {
    throw new Error("Failed to fetch meeting status")
  }

  return response.json()
}

/**
 * Get meeting conversation (public)
 * GET /api/meetings/:id/conversation
 */
export async function getMeetingConversation(id: string): Promise<ConversationTurn[]> {
  const response = await publicFetch(`/api/meetings/${id}/conversation`)

  if (!response.ok) {
    throw new Error("Failed to fetch conversation")
  }

  return response.json()
}

/**
 * Get meeting whiteboard (public)
 * GET /api/meetings/:id/whiteboard
 */
export async function getMeetingWhiteboard(id: string): Promise<{
  keyFacts: string[]
  decisions: string[]
  actionItems: string[]
}> {
  const response = await publicFetch(`/api/meetings/${id}/whiteboard`)

  if (!response.ok) {
    throw new Error("Failed to fetch whiteboard")
  }

  return response.json()
}

/**
 * Start a meeting (requires Bearer auth)
 * POST /api/meetings/:id/start
 */
export async function startMeeting(id: string): Promise<{ success: boolean }> {
  const response = await authenticatedFetch(`/api/meetings/${id}/start`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Failed to start meeting")
  }

  return response.json()
}

/**
 * Inject human message into meeting (public)
 * POST /api/meetings/:id/inject
 */
export async function injectHumanMessage(
  meetingId: string,
  message: string,
  sender: string,
): Promise<{ success: boolean }> {
  return injectMessage(meetingId, message, sender)
}

/**
 * Inject human message into meeting (public)
 * POST /api/meetings/:id/inject
 */
export async function injectMessage(meetingId: string, message: string, sender: string): Promise<{ success: boolean }> {
  const response = await publicFetch(`/api/meetings/${meetingId}/inject`, {
    method: "POST",
    body: JSON.stringify({ message, author: sender }),
  })

  if (!response.ok) {
    throw new Error("Failed to inject message")
  }

  return response.json()
}

/**
 * Get participant info by token (public, token via query param)
 * GET /api/participant?token=TOKEN
 */
export async function getParticipantInfo(token: string): Promise<{
  participant: Participant
  meeting: Meeting
}> {
  const response = await publicFetch(`/api/participant?token=${token}`)

  if (!response.ok) {
    throw new Error("Failed to fetch participant info")
  }

  return response.json()
}

/**
 * Submit participant input (public)
 * POST /api/participant/submit
 */
export async function submitParticipantInput(token: string, content: string): Promise<{ success: boolean }> {
  const response = await publicFetch("/api/participant/submit", {
    method: "POST",
    body: JSON.stringify({ token, content }),
  })

  if (!response.ok) {
    throw new Error("Failed to submit input")
  }

  return response.json()
}

/**
 * Inject participant message into meeting (public)
 * POST /api/participant/inject
 */
export async function injectParticipantMessage(token: string, message: string): Promise<{ success: boolean }> {
  const response = await publicFetch("/api/participant/inject", {
    method: "POST",
    body: JSON.stringify({ token, message }),
  })

  if (!response.ok) {
    throw new Error("Failed to inject participant message")
  }

  return response.json()
}

/**
 * Health check (public)
 * GET /api/health
 */
export async function checkHealth(): Promise<{ status: string }> {
  const response = await publicFetch("/api/health")

  if (!response.ok) {
    throw new Error("Health check failed")
  }

  return response.json()
}

/**
 * Get meeting report (public)
 * GET /api/meetings/:id/report
 */
export async function getMeetingReport(id: string): Promise<MeetingReport> {
  const response = await publicFetch(`/api/meetings/${id}/report`)

  if (!response.ok) {
    throw new Error("Failed to fetch meeting report")
  }

  return response.json()
}
