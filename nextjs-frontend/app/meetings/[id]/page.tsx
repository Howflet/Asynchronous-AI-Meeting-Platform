"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  getMeeting,
  getMeetingConversation,
  getMeetingWhiteboard,
  startMeeting,
  pauseMeeting,
  resumeMeeting,
  injectHumanMessage,
} from "@/lib/api"
import type { Meeting, ConversationTurn, Whiteboard } from "@/lib/types"
import { StatusBadge } from "@/components/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Play,
  Pause,
  Send,
  Users,
  Calendar,
  ChevronRight,
  ChevronDown,
  FileText,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function MeetingViewPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string
  const { toast } = useToast()

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [whiteboard, setWhiteboard] = useState<Whiteboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [humanMessage, setHumanMessage] = useState("")
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false)
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isPausing, setIsPausing] = useState(false)

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadMeetingData()
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [meetingId])

  useEffect(() => {
    if (meeting && (meeting.status === "running" || meeting.status === "paused")) {
      startPolling()
    } else {
      stopPolling()
    }
  }, [meeting]) // Updated dependency to be more exhaustive



  const loadMeetingData = async () => {
    try {
      setIsLoading(true)
      const meetingData = await getMeeting(meetingId)
      setMeeting(meetingData)

      if (meetingData.status === "running" || meetingData.status === "paused" || meetingData.status === "completed") {
        const [conversationData, whiteboardData] = await Promise.all([
          getMeetingConversation(meetingId),
          getMeetingWhiteboard(meetingId),
        ])
        setConversation(conversationData)
        setWhiteboard(whiteboardData)
      }

      setError(null)
    } catch (err) {
      setError("Failed to load meeting. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startPolling = () => {
    if (pollIntervalRef.current) return

    pollIntervalRef.current = setInterval(async () => {
      try {
        const [meetingData, conversationData, whiteboardData] = await Promise.all([
          getMeeting(meetingId),
          getMeetingConversation(meetingId),
          getMeetingWhiteboard(meetingId),
        ])
        setMeeting(meetingData)
        setConversation(conversationData)
        setWhiteboard(whiteboardData)
      } catch (err) {
        console.error("Polling error:", err)
      }
    }, 5000)
  }

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  const handleStartMeeting = async () => {
    setIsStarting(true)
    try {
      await startMeeting(meetingId)
      toast({
        title: "Meeting Started",
        description: "The AI meeting is now in progress",
      })
      await loadMeetingData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to start meeting",
        variant: "destructive",
      })
    } finally {
      setIsStarting(false)
    }
  }

  const handlePauseMeeting = async () => {
    setIsPausing(true)
    try {
      await pauseMeeting(meetingId)
      toast({
        title: "Meeting Paused",
        description: "You can now inject a message",
      })
      await loadMeetingData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to pause meeting",
        variant: "destructive",
      })
    } finally {
      setIsPausing(false)
    }
  }

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!humanMessage.trim()) return

    setIsSubmittingMessage(true)
    try {
      await injectHumanMessage(meetingId, humanMessage, "Host")
      await resumeMeeting(meetingId)
      setHumanMessage("")
      toast({
        title: "Message Sent",
        description: "Your message has been added and the meeting resumed",
      })
      await loadMeetingData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingMessage(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-8 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <p className="mb-4 text-destructive">{error || "Meeting not found"}</p>
            <Link href="/meetings">
              <Button>Back to Meetings</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const allParticipantsSubmitted = meeting.participants.every((p) => p.hasSubmitted)
  const canStart = meeting.status === "awaiting_inputs" && allParticipantsSubmitted

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/meetings"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meetings
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{meeting.subject}</h1>
            <StatusBadge status={meeting.status} />
          </div>
          <p className="mb-4 text-muted-foreground">{meeting.details}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(meeting.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {meeting.participants.length} participants
            </div>
          </div>
        </div>

        {/* Awaiting Inputs State */}
        {meeting.status === "awaiting_inputs" && (
          <Card className="mb-6 p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Participant Status</h3>
            <div className="space-y-2">
              {meeting.participants.map((participant, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <div className="font-medium text-foreground">{participant.name || participant.email}</div>
                    <div className="text-sm text-muted-foreground">{participant.email}</div>
                  </div>
                  <Badge variant={participant.hasSubmitted ? "default" : "outline"}>
                    {participant.hasSubmitted ? "Submitted" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
            {canStart && (
              <div className="mt-6">
                <Button onClick={handleStartMeeting} disabled={isStarting} className="w-full sm:w-auto">
                  {isStarting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start AI Meeting
                    </>
                  )}
                </Button>
              </div>
            )}
            {!allParticipantsSubmitted && (
              <p className="mt-4 text-sm text-muted-foreground">
                Waiting for all participants to submit their input before the meeting can begin.
              </p>
            )}
          </Card>
        )}

        {/* Meeting Completed State */}
        {meeting.status === "completed" && (
          <Card className="mb-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">Meeting Completed</h3>
                <p className="text-muted-foreground">The AI meeting has finished. View the full report for insights.</p>
              </div>
              <Link href={`/meetings/${meetingId}/report`}>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  View Report
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        {(meeting.status === "running" || meeting.status === "paused" || meeting.status === "completed") && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Conversation Area */}
            <div className="lg:col-span-2">
              <Card className="flex h-[600px] flex-col border shadow-sm">
                <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-foreground">Live Conversation</h2>
                    {conversation.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {conversation.length} message{conversation.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.status === "running" && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">Live</span>
                      </div>
                    )}
                    {meeting.status === "running" && (
                      <Button size="sm" variant="outline" onClick={handlePauseMeeting} disabled={isPausing}>
                        {isPausing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Pausing...
                          </>
                        ) : (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div 
                  className="flex-1 p-4 overflow-y-auto overflow-x-hidden"
                  style={{ maxHeight: '500px' }}
                >
                  <div className="space-y-4">
                    {conversation.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-muted-foreground min-h-[400px]">
                        <div className="text-center">
                          <div className="mb-3 text-4xl">💬</div>
                          <p className="text-sm">Conversation will appear here...</p>
                        </div>
                      </div>
                    ) : (
                      conversation.map((turn, index) => {
                        const isModerator = turn.speaker === "Moderator" || turn.speaker.toLowerCase().includes("moderator")
                        const isHuman = turn.speaker.toLowerCase().includes('human') || turn.speaker.toLowerCase().includes('host')
                        
                        return (
                          <div
                            key={turn.id}
                            className={`rounded-lg p-4 shadow-sm transition-colors ${
                              isModerator 
                                ? "border border-primary/20 bg-primary/5" 
                                : isHuman
                                  ? "border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                                  : "border border-border bg-card"
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{turn.speaker}</span>
                                {isModerator && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                    Moderator
                                  </span>
                                )}
                                {isHuman && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium">
                                    Human
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">{formatTime(turn.createdAt)}</span>
                            </div>
                            <div className="leading-relaxed text-foreground whitespace-pre-wrap">
                              {turn.message}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Paused State - Human Input */}
                {meeting.status === "paused" && (
                  <div className="border-t border-border bg-muted/30 p-4">
                    <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <p className="text-sm font-medium text-foreground">Meeting Paused - Add Your Input</p>
                      <p className="text-xs text-muted-foreground">
                        Inject a message to guide the discussion, then the meeting will resume
                      </p>
                    </div>
                    <form onSubmit={handleSubmitMessage} className="flex gap-2">
                      <Textarea
                        placeholder="Type your message to inject into the conversation..."
                        value={humanMessage}
                        onChange={(e) => setHumanMessage(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                      <Button type="submit" disabled={isSubmittingMessage || !humanMessage.trim()}>
                        {isSubmittingMessage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants */}
              <Card className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Participants</h3>
                <div className="space-y-2">
                  {meeting.participants.map((participant, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {(participant.name || participant.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-foreground">{participant.name || participant.email}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Whiteboard */}
              {whiteboard && (
                <Card className="p-4">
                  <button
                    onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
                    className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-foreground"
                  >
                    <span>Whiteboard</span>
                    {isWhiteboardOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  {isWhiteboardOpen && (
                    <div className="space-y-4">
                      {whiteboard.keyFacts.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Key Facts</h4>
                          <ul className="space-y-1 text-sm">
                            {whiteboard.keyFacts.map((fact, index) => (
                              <li key={index} className="text-foreground">
                                • {fact}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {whiteboard.decisions.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Decisions</h4>
                            <ul className="space-y-1 text-sm">
                              {whiteboard.decisions.map((decision, index) => (
                                <li key={index} className="text-foreground">
                                  • {decision}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {whiteboard.actionItems.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Action Items</h4>
                            <ul className="space-y-1 text-sm">
                              {whiteboard.actionItems.map((item, index) => (
                                <li key={index} className="text-foreground">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {whiteboard.keyFacts.length === 0 &&
                        whiteboard.decisions.length === 0 &&
                        whiteboard.actionItems.length === 0 && (
                          <p className="text-sm text-muted-foreground">No items yet...</p>
                        )}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
