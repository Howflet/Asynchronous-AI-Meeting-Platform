// Shared TypeScript types for A²MP platform

export type MeetingStatus = "awaiting_inputs" | "running" | "paused" | "completed"

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
  subject: string
  date: string
  executiveSummary: string
  highlights: string[]
  decisions: string[]
  actionItems: string[]
  transcript: ConversationTurn[]
}
