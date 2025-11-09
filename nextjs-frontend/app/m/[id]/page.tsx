"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Send,
  Users,
  Clock,
  AlertCircle,
  Play,
  Pause,
  Square,
  FastForward,
  MessageSquare,
  FileText,
  Trash2,
} from "lucide-react"
import { getMeetingStatus, injectMessage, startMeeting, pauseMeeting, resumeMeeting, advanceMeeting, endMeeting, deleteMeeting } from "@/lib/api"
import type { Meeting, ConversationTurn } from "@/lib/types"
import Link from "next/link"

export default function MeetingLivePage() {
  const params = useParams()
  const meetingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [isHost, setIsHost] = useState(false)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [personas, setPersonas] = useState<any[]>([])
  const [whiteboard, setWhiteboard] = useState({ keyFacts: [], decisions: [], actionItems: [] })

  const [message, setMessage] = useState("")
  const [sender, setSender] = useState("")
  const [sending, setSending] = useState(false)


  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if user is authenticated as host
    const hostAuth = localStorage.getItem("hostAuthenticated")
    setIsHost(hostAuth === "true")
    
    loadMeetingData()

    // Poll every 5 seconds for updates
    pollIntervalRef.current = setInterval(loadMeetingData, 5000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [meetingId])



  const loadMeetingData = async () => {
    try {
      const data = await getMeetingStatus(meetingId)
      console.log('API Response:', data) // Debug log
      
      setMeeting(data.meeting)
      
      // Ensure conversation is a proper array of turn objects
      if (Array.isArray(data.conversation)) {
        console.log('Conversation data:', data.conversation)
        const validConversation = data.conversation.filter(turn => {
          const isValid = turn && 
                          typeof turn === 'object' && 
                          typeof turn.speaker === 'string' && 
                          typeof turn.message === 'string'
          if (!isValid) {
            console.warn('Invalid conversation turn:', turn)
          }
          return isValid
        })
        setConversation(validConversation)
      } else {
        console.warn('Conversation is not an array:', data.conversation)
        setConversation([])
      }
      
      setPersonas(Array.isArray(data.personas) ? data.personas : [])
    } catch (error) {
      console.error("Failed to load meeting:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInjectMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !sender.trim()) return

    setSending(true)
    try {
      await injectMessage(meetingId, message, sender)
      setMessage("")
      await loadMeetingData()
    } catch (error: any) {
      alert(error.message || "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleStart = async () => {
    try {
      await startMeeting(meetingId)
      await loadMeetingData()
    } catch (error: any) {
      alert(error.message || "Failed to start meeting")
    }
  }

  const handlePause = async () => {
    try {
      await pauseMeeting(meetingId)
      await loadMeetingData()
    } catch (error: any) {
      alert(error.message || "Failed to pause meeting")
    }
  }

  const handleResume = async () => {
    try {
      await resumeMeeting(meetingId)
      await loadMeetingData()
    } catch (error: any) {
      alert(error.message || "Failed to resume meeting")
    }
  }

  const handleAdvance = async () => {
    try {
      await advanceMeeting(meetingId)
      await loadMeetingData()
    } catch (error: any) {
      alert(error.message || "Failed to advance meeting")
    }
  }

  const handleEnd = async () => {
    if (!confirm("Are you sure you want to end this meeting? This will generate the final report and mark the meeting as completed.")) {
      return
    }
    
    try {
      await endMeeting(meetingId)
      await loadMeetingData()
    } catch (error: any) {
      alert(error.message || "Failed to end meeting")
    }
  }

  const handleDelete = async () => {
    if (!confirm("⚠️ DELETE MEETING?\n\nThis will permanently delete this meeting and all its data including:\n• All conversation history\n• Meeting reports\n• Participant data\n• Whiteboards\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?")) {
      return
    }
    
    try {
      await deleteMeeting(meetingId)
      // Redirect to meetings list after successful deletion
      window.location.href = "/meetings"
    } catch (error: any) {
      alert(error.message || "Failed to delete meeting")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Meeting Not Found</h1>
          <p className="text-slate-600">This meeting does not exist or has been removed.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{meeting.subject}</h1>
              <p className="text-slate-600">{meeting.details}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                meeting.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : meeting.status === "running"
                    ? "bg-blue-100 text-blue-700"
                    : meeting.status === "paused"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-slate-100 text-slate-700"
              }`}
            >
              {meeting.status}
            </span>
          </div>

          {/* Meeting Controls - Only visible to hosts */}
          {isHost && (
            <div className="flex gap-2">
              {meeting.status === "awaiting_inputs" && (
                <Button onClick={handleStart} size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Start Meeting
                </Button>
              )}
              {meeting.status === "running" && (
                <>
                  <Button onClick={handlePause} size="sm" variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button onClick={handleAdvance} size="sm" variant="outline">
                    <FastForward className="w-4 h-4 mr-2" />
                    Advance Turn
                  </Button>
                  <Button onClick={handleEnd} size="sm" variant="destructive">
                    <Square className="w-4 h-4 mr-2" />
                    End Meeting
                  </Button>
                </>
              )}
              {meeting.status === "paused" && (
                <>
                  <Button onClick={handleResume} size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                  <Button onClick={handleEnd} size="sm" variant="destructive">
                    <Square className="w-4 h-4 mr-2" />
                    End Meeting
                  </Button>
                </>
              )}
              {meeting.status === "completed" && (
                <Button asChild size="sm">
                  <Link href={`/r/${meetingId}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Report
                  </Link>
                </Button>
              )}
              {meeting.status === "cancelled" && (
                <div className="text-sm text-red-600 font-medium">
                  ⚠️ This meeting has been cancelled
                </div>
              )}
              
              {/* Delete button - always available for hosts */}
              <div className="border-t pt-3 mt-3">
                <Button 
                  onClick={handleDelete} 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Meeting
                </Button>
              </div>
            </div>
          )}
          
          {/* Non-host message for viewing only */}
          {!isHost && (
            <p className="text-sm text-slate-600">
              Viewing as observer. <Link href="/host" className="text-blue-600 hover:underline">Login as host</Link> to control the meeting.
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Conversation */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Live Conversation
              </h2>

              <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto">
                {conversation.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p>Waiting for conversation to begin...</p>
                  </div>
                ) : (
                  conversation
                    .filter(turn => turn && typeof turn === 'object' && turn.speaker && turn.message)
                    .map((turn, index) => {
                    // Ensure speaker is a string
                    const speakerStr = typeof turn.speaker === 'string' ? turn.speaker : String(turn.speaker)
                    
                    // Parse speaker to determine type and clean name
                    const isModerator = speakerStr === "Moderator" || speakerStr.toLowerCase().includes("moderator")
                    const isHuman = speakerStr.startsWith('Human:')
                    const isAI = speakerStr.startsWith('AI:')
                    
                    // Extract clean name without AI:/Human: prefixes
                    let cleanSpeakerName = speakerStr
                    if (isHuman) {
                      cleanSpeakerName = speakerStr.replace('Human:', '').trim()
                    } else if (isAI) {
                      cleanSpeakerName = speakerStr.replace('AI:', '').trim()
                    }
                    
                    return (
                      <div
                        key={turn.id || index}
                        className={`rounded-lg p-4 shadow-sm border transition-colors ${
                          isModerator 
                            ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950" 
                            : isHuman
                              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                              : isAI
                                ? "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
                                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{String(cleanSpeakerName || 'Unknown')}</span>
                            {isModerator && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
                                Moderator
                              </span>
                            )}
                            {isHuman && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium">
                                Human
                              </span>
                            )}
                            {isAI && (
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-medium">
                                Persona
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {String(turn.message || '')}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Message Injection - Only for hosts */}
              {isHost && (meeting.status === "running" || meeting.status === "paused") && (
                <form onSubmit={handleInjectMessage} className="space-y-3 border-t pt-4">
                  <h3 className="font-medium text-slate-900">Inject Message</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <Input
                        placeholder="Your name"
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        />
                        <Button type="submit" size="icon" disabled={sending}>
                          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Participants */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                AI Personas ({personas.length})
              </h3>
              <div className="space-y-2">
                {personas.map((persona, index) => {
                  let displayName = `Persona ${index + 1}`
                  if (typeof persona === 'string') {
                    displayName = persona
                  } else if (persona && typeof persona === 'object' && persona.name) {
                    displayName = String(persona.name)
                  }
                  
                  return (
                    <div key={persona?.id || index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-slate-700">{displayName}</span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Meeting Info */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Meeting Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>Created {new Date(meeting.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MessageSquare className="w-4 h-4" />
                  <span>{conversation.length} messages</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
