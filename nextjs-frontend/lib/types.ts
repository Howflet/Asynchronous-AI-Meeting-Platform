// Shared TypeScript types for A²MP platform

export type MeetingStatus = "awaiting_inputs" | "running" | "paused" | "completed" | "cancelled"

export interface Participant {
  id?: string
  email: string
  name?: string
  hasSubmitted?: boolean
  token?: string
  input?: string
}

export interface Meeting {
  id: string
  subject: string
  details: string
  status: MeetingStatus
  createdAt: string
  participants: Participant[]
  pauseReason?: 'host' | 'ai' | null
}

export interface ConversationTurn {
  id: string
  speaker: string
  message: string
  createdAt: string
  isModerator?: boolean
}

export interface Whiteboard {
  keyFacts: string[]
  decisions: string[]
  actionItems: string[]
}

export interface MeetingReport {
  id: string
  meetingId?: string
  subject: string
  date: string
  highlights: string[]
  decisions: string[]
  actionItems: string[]
  createdAt?: string
  citations?: Citation[]
}

export interface Citation {
  id: string
  meeting_id: string
  persona_id: string
  message_id: string
  title?: string | null
  url: string
  snippet?: string | null
  created_at?: number
}
