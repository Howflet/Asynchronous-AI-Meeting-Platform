"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Copy, Check, Clock, Eye } from "lucide-react"
import { createMeeting, getMeetings } from "@/lib/api"
import type { Meeting } from "@/lib/types"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HostPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(false)

  // Create meeting form state
  const [subject, setSubject] = useState("")
  const [details, setDetails] = useState("")
  const [participants, setParticipants] = useState([{ email: "", name: "" }])
  const [createdMeeting, setCreatedMeeting] = useState<{
    meeting: Meeting
    participants: Array<{ token: string; email: string; name?: string }>
  } | null>(null)
  const [copiedTokens, setCopiedTokens] = useState<Set<string>>(new Set())

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem("hostAuthenticated")
    if (auth === "true") {
      setIsAuthenticated(true)
      loadMeetings()
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "12345") {
      setIsAuthenticated(true)
      localStorage.setItem("hostAuthenticated", "true")
      setLoginError("")
      loadMeetings()
    } else {
      setLoginError("Invalid password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("hostAuthenticated")
    setPassword("")
  }

  const loadMeetings = async () => {
    try {
      const data = await getMeetings()
      setMeetings(data)
    } catch (error) {
      console.error("Failed to load meetings:", error)
    }
  }

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createMeeting(
        subject,
        details,
        participants.filter((p) => p.email.trim()),
      )

      setCreatedMeeting(result)
      setShowCreateForm(false)
      loadMeetings()
    } catch (error: any) {
      alert(error.message || "Failed to create meeting")
    } finally {
      setLoading(false)
    }
  }

  const addParticipant = () => {
    setParticipants([...participants, { email: "", name: "" }])
  }

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  const updateParticipant = (index: number, field: "email" | "name", value: string) => {
    const updated = [...participants]
    updated[index][field] = value
    setParticipants(updated)
  }

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/p?token=${token}`
    navigator.clipboard.writeText(link)
    setCopiedTokens((prev) => new Set(prev).add(token))
    setTimeout(() => {
      setCopiedTokens((prev) => {
        const newSet = new Set(prev)
        newSet.delete(token)
        return newSet
      })
    }, 2000)
  }

  const resetForm = () => {
    setSubject("")
    setDetails("")
    setParticipants([{ email: "", name: "" }])
    setCreatedMeeting(null)
    setShowCreateForm(false)
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Host Dashboard</h1>
            <p className="text-slate-600">Enter password to access admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter host password"
                className="mt-1"
              />
              {loginError && <p className="text-sm text-red-600 mt-1">{loginError}</p>}
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Default password: 12345</p>
          </div>
        </Card>
      </div>
    )
  }

  // Success screen after creating meeting
  if (createdMeeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto py-12">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Meeting Created Successfully!</h1>
              <p className="text-slate-600">Share these invitation links with your participants</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">{createdMeeting.meeting.subject}</h3>
                <p className="text-sm text-slate-600">{createdMeeting.meeting.details}</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Participant Invitation Links</h3>
                <div className="space-y-2">
                  {createdMeeting.participants.map((participant) => (
                    <div key={participant.token} className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">{participant.name || participant.email}</p>
                        <p className="text-xs text-slate-500 font-mono break-all">
                          {window.location.origin}/p?token={participant.token}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => copyInvitationLink(participant.token)}>
                        {copiedTokens.has(participant.token) ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={resetForm} variant="outline" className="flex-1 bg-transparent">
                Create Another Meeting
              </Button>
              <Button onClick={() => router.push(`/m/${createdMeeting.meeting.id}`)} className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                View Live Meeting
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Create meeting form
  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-3xl mx-auto py-12">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-slate-900">Create New Meeting</h1>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-6">
              <div>
                <Label htmlFor="subject">Meeting Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Q4 Product Strategy Discussion"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="details">Meeting Details *</Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide context and discussion points for the AI moderator..."
                  rows={4}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Participants</Label>
                <div className="space-y-3 mt-2">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Email *"
                        type="email"
                        value={participant.email}
                        onChange={(e) => updateParticipant(index, "email", e.target.value)}
                        required
                        className="flex-1"
                      />
                      <Input
                        placeholder="Name (optional)"
                        value={participant.name}
                        onChange={(e) => updateParticipant(index, "name", e.target.value)}
                        className="flex-1"
                      />
                      {participants.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeParticipant(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" onClick={addParticipant} className="mt-3 bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Participant
                </Button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Meeting"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Host Dashboard</h1>
            <p className="text-slate-600">Manage your AI-powered meetings</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Meeting
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {meetings.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No meetings yet</h3>
            <p className="text-slate-600 mb-6">Create your first AI-moderated meeting to get started</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Meeting
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">{meeting.subject}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{meeting.details}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
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

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(meeting.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href={`/m/${meeting.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Live View
                    </Link>
                  </Button>
                  {meeting.status === "completed" && (
                    <Button size="sm" asChild className="flex-1">
                      <Link href={`/r/${meeting.id}`}>View Report</Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
