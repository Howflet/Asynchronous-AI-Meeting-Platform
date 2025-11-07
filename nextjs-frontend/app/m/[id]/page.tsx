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
  FastForward,
  MessageSquare,
  FileText,
} from "lucide-react"
import { getMeetingStatus, injectMessage, startMeeting, pauseMeeting, resumeMeeting, advanceMeeting } from "@/lib/api"
import type { Meeting, ConversationTurn } from "@/lib/types"
import Link from "next/link"

export default function MeetingLivePage() {
  const params = useParams()
  const meetingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [personas, setPersonas] = useState<any[]>([])
  const [whiteboard, setWhiteboard] = useState({ keyFacts: [], decisions: [], actionItems: [] })

  const [message, setMessage] = useState("")
  const [sender, setSender] = useState("")
  const [sending, setSending] = useState(false)

  const conversationEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    loadMeetingData()

    // Poll every 5 seconds for updates
    pollIntervalRef.current = setInterval(loadMeetingData, 5000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [meetingId])

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation])

  const loadMeetingData = async () => {
    try {
      const data = await getMeetingStatus(meetingId)
      setMeeting(data.meeting)
      setConversation(data.conversation)
      setPersonas(data.personas || [])
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

          {/* Meeting Controls */}
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
              </>
            )}
            {meeting.status === "paused" && (
              <Button onClick={handleResume} size="sm">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            {meeting.status === "completed" && (
              <Button asChild size="sm">
                <Link href={`/r/${meetingId}`}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Report
                </Link>
              </Button>
            )}
          </div>
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
                  conversation.map((turn, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        turn.role === "moderator"
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : turn.role === "human"
                            ? "bg-green-50 border-l-4 border-green-500"
                            : "bg-slate-50 border-l-4 border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm text-slate-900">{turn.speaker}</span>
                        <span className="text-xs text-slate-500">{turn.role}</span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{turn.content}</p>
                    </div>
                  ))
                )}
                <div ref={conversationEndRef} />
              </div>

              {/* Message Injection */}
              {(meeting.status === "running" || meeting.status === "paused") && (
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
                {personas.map((persona, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-slate-700">{persona.name || `Persona ${index + 1}`}</span>
                  </div>
                ))}
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
