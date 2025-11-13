"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { getParticipantInfo, getMeetingConversation, getMeetingWhiteboard, injectParticipantMessage } from "@/lib/api"
import type { ConversationTurn, Whiteboard, MeetingStatus } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/status-badge"
import { 
  MessageSquare, 
  Clock, 
  Send, 
  AlertCircle, 
  Users,
  Loader2,
  FileText,
  Wifi,
  WifiOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { io, Socket } from 'socket.io-client'

export default function ParticipantLivePage() {
  const params = useParams()
  const token = params.token as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState("")
  const [participantEmail, setParticipantEmail] = useState("")
  const [meetingSubject, setMeetingSubject] = useState("")
  const [meetingDetails, setMeetingDetails] = useState("")
  const [meetingId, setMeetingId] = useState("")
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>("awaiting_inputs")
  const [pauseReason, setPauseReason] = useState<'host' | 'ai' | null>(null)
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [whiteboard, setWhiteboard] = useState<Whiteboard>({ keyFacts: [], decisions: [], actionItems: [] })
  const [message, setMessage] = useState("")
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')

  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    loadInitialData()
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [token])

  useEffect(() => {
    // Connect to Socket.IO for any meeting that has an ID, regardless of status
    // This ensures real-time updates work for all meeting states
    if (meetingId) {
      connectToSocket()
    } else {
      disconnectFromSocket()
    }
  }, [meetingId])



  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      const data = await getParticipantInfo(token)
      
      if (!data.participant.hasSubmitted) {
        // Redirect back to input page if they haven't submitted yet
        window.location.href = `/participate/${token}`
        return
      }

      setParticipantName(data.participant.name || data.participant.email)
      setParticipantEmail(data.participant.email)
      setMeetingSubject(data.meeting.subject)
      setMeetingDetails(data.meeting.details)
      setMeetingId(data.meeting.id)
      setMeetingStatus(data.meeting.status)
      setPauseReason(data.meeting.pauseReason || null)

      console.log('Participant data loaded:', {
        participant: data.participant.email,
        meetingId: data.meeting.id,
        meetingStatus: data.meeting.status,
        hasSubmitted: data.participant.hasSubmitted
      })

      // Always try to load conversation data regardless of meeting status
      // This ensures all participants can see the conversation history
      await loadConversationData()

      setError(null)
    } catch (err) {
      setError("Invalid or expired invitation link. Please contact the meeting organizer.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversationData = async () => {
    if (!meetingId) return
    
    try {
      const [conversationData, whiteboardData] = await Promise.all([
        getMeetingConversation(meetingId),
        getMeetingWhiteboard(meetingId)
      ])
      console.log('Loaded conversation data:', conversationData.length, 'turns')
      setConversation(conversationData)
      setWhiteboard(whiteboardData)
    } catch (err) {
      console.error("Failed to load conversation data:", err)
      // Set empty arrays as fallback to avoid UI issues
      setConversation([])
      setWhiteboard({ keyFacts: [], decisions: [], actionItems: [] })
    }
  }

  const connectToSocket = () => {
    if (socketRef.current || !meetingId) return

    console.log('Attempting to connect to Socket.IO for meeting:', meetingId)
    setConnectionStatus('connecting')
    
    // Connect to the backend Socket.IO server using current origin
    const socketUrl = window.location.origin
    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server, joining meeting room:', meetingId)
      setIsConnected(true)
      setConnectionStatus('connected')
      
      // Join the meeting room for real-time updates (backend expects 'join' event)
      socket.emit('join', meetingId)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
      setIsConnected(false)
      setConnectionStatus('disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
      setConnectionStatus('error')
    })

    // Listen for conversation turn updates (backend emits 'turn')
    socket.on('turn', async (turnData) => {
      console.log('Received new turn:', turnData)
      await loadConversationData()
    })

    // Listen for meeting status updates (backend emits 'status')
    socket.on('status', async (data) => {
      console.log('Received meeting status update:', data)
      if (data.status) {
        setMeetingStatus(data.status)
        setPauseReason(data.pauseReason || null)
        // Also reload conversation when status changes to ensure consistency
        loadConversationData()
      }
    })

    // Listen for whiteboard updates (backend emits 'whiteboard')
    socket.on('whiteboard', async (whiteboardData) => {
      console.log('Received whiteboard update:', whiteboardData)
      await loadConversationData() // This also loads whiteboard
    })
  }

  const disconnectFromSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }
  }

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmittingMessage(true)
    try {
      // Note: We'll need to implement this API endpoint
      await injectParticipantMessage(token, message)
      setMessage("")
      toast({
        title: "Message Sent",
        description: "Your message has been added to the conversation",
      })
      await loadConversationData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingMessage(false)
    }
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12 pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">Invalid Link</h2>
            <p className="text-muted-foreground">{error}</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 pt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{meetingSubject}</h1>
              <p className="text-sm text-muted-foreground">Welcome, {participantName}</p>
            </div>
            <StatusBadge status={meetingStatus} />
          </div>
          <p className="text-muted-foreground">{meetingDetails}</p>
        </div>

        {/* Meeting Status Messages */}
        {meetingStatus === "awaiting_inputs" && (
          <Card className="mb-6 p-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Waiting for Meeting to Start
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  The AI meeting will begin once all participants have submitted their input.
                </p>
              </div>
            </div>
          </Card>
        )}

        {meetingStatus === "paused" && (
          <Card className={`mb-6 p-4 ${
            pauseReason === "host" 
              ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
              : "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800"
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className={`h-5 w-5 ${
                pauseReason === "host"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-orange-600 dark:text-orange-400"
              }`} />
              <div>
                <p className={`font-medium ${
                  pauseReason === "host"
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-orange-900 dark:text-orange-100"
                }`}>
                  {pauseReason === "host" ? "Meeting Paused by Host" : "Your Input Requested"}
                </p>
                <p className={`text-sm ${
                  pauseReason === "host"
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-orange-700 dark:text-orange-300"
                }`}>
                  {pauseReason === "host" 
                    ? "The meeting has been temporarily paused by the host. Please wait for it to resume."
                    : "The conversation needs human guidance. Use the message box below to contribute."
                  }
                </p>
              </div>
            </div>
          </Card>
        )}

        {meetingStatus === "completed" && (
          <Card className="mb-6 p-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Meeting Complete
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    The AI meeting has concluded. Review the conversation and outcomes below.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

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
                <div className="flex items-center gap-3">
                  {meetingStatus === "running" && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-muted-foreground">Live</span>
                    </div>
                  )}
                  
                  {/* Connection Status Indicator */}
                  <div className="flex items-center gap-1">
                    {connectionStatus === 'connected' && (
                      <>
                        <Wifi className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
                      </>
                    )}
                    {connectionStatus === 'connecting' && (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">Connecting...</span>
                      </>
                    )}
                    {connectionStatus === 'disconnected' && (
                      <>
                        <WifiOff className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-400">Disconnected</span>
                      </>
                    )}
                    {connectionStatus === 'error' && (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-400">Connection Error</span>
                      </>
                    )}
                  </div>
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
                        <p className="text-sm">
                          {meetingStatus === "awaiting_inputs" 
                            ? "Waiting for meeting to start..." 
                            : "Conversation will appear here..."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    conversation.map((turn, index) => {
                      // Parse speaker to determine type and clean name
                      const isModerator = turn.speaker === "Moderator" || turn.speaker.toLowerCase().includes("moderator")
                      const isHuman = turn.speaker.startsWith('Human:')
                      const isAI = turn.speaker.startsWith('AI:')
                      
                      // Extract clean name without AI:/Human: prefixes
                      let cleanSpeakerName = turn.speaker
                      if (isHuman) {
                        cleanSpeakerName = turn.speaker.replace('Human:', '').trim()
                      } else if (isAI) {
                        cleanSpeakerName = turn.speaker.replace('AI:', '').trim()
                      }
                      
                      // Check if this is the current participant's message
                      const isMyMessage = cleanSpeakerName === participantEmail
                      
                      return (
                        <div
                          key={turn.id}
                          className={`rounded-lg p-4 shadow-sm transition-colors ${
                            isModerator 
                              ? "border border-primary/20 bg-primary/5" 
                              : isHuman
                                ? "border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                                : isAI
                                  ? "border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                                  : "border border-border bg-card"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{cleanSpeakerName}</span>
                              {isModerator && (
                                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                  Moderator
                                </span>
                              )}
                              {isHuman && (
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium">
                                  {isMyMessage ? "You" : "Human"}
                                </span>
                              )}
                              {isAI && (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
                                  Persona
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

              {/* Message Input for Paused State */}
              {meetingStatus === "paused" && pauseReason === "ai" && (
                <div className="border-t border-border bg-muted/30 p-4">
                  <form onSubmit={handleSubmitMessage} className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Add Your Voice to the Conversation</p>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Your guidance or perspective is needed. Share your thoughts..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                        className="resize-none flex-1"
                      />
                      <Button type="submit" disabled={isSubmittingMessage || !message.trim()} className="bg-[#1800ad] hover:bg-[#1400a0] text-white">
                        {isSubmittingMessage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Persona */}
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Your AI Persona</h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {participantName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-foreground">AI:{participantEmail}</div>
                  <div className="text-xs text-muted-foreground">Represents your perspective</div>
                </div>
              </div>
            </Card>

            {/* Whiteboard */}
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Meeting Notes</h3>
              
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
                    {whiteboard.keyFacts.length > 0 && <Separator />}
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
                    {(whiteboard.keyFacts.length > 0 || whiteboard.decisions.length > 0) && <Separator />}
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
                    <p className="text-sm text-muted-foreground">No notes yet...</p>
                  )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}