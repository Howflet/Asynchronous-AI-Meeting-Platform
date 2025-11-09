"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createMeeting } from "@/lib/api"
import type { Participant } from "@/lib/types"
import { Plus, X, Copy, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CreateMeetingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [subject, setSubject] = useState("")
  const [details, setDetails] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([
    { email: "", name: "" },
    { email: "", name: "" },
    { email: "", name: "" },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitationLinks, setInvitationLinks] = useState<{ email: string; link: string }[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem("hostAuthenticated")
    if (auth === "true") {
      setIsAuthenticated(true)
    } else {
      // Redirect to host login if not authenticated
      router.push("/host")
    }
  }, [router])

  const addParticipant = () => {
    setParticipants([...participants, { email: "", name: "" }])
  }

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index))
    }
  }

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants]
    updated[index] = { ...updated[index], [field]: value }
    setParticipants(updated)
  }

  const copyToClipboard = async (link: string, index: number) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
      toast({
        title: "Copied!",
        description: "Invitation link copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!subject.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a meeting subject",
        variant: "destructive",
      })
      return
    }

    if (!details.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter meeting details",
        variant: "destructive",
      })
      return
    }

    const validParticipants = participants.filter((p) => p.email.trim())
    if (validParticipants.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please add at least 2 participants",
        variant: "destructive",
      })
      return
    }

    // Check for valid emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = validParticipants.filter((p) => !emailRegex.test(p.email))
    if (invalidEmails.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid email addresses",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Creating meeting with:", { subject, details, validParticipants });
      const result = await createMeeting(subject, details, validParticipants)
      console.log("Meeting creation result:", result);
      
      // Set invitation links if they exist
      if (result?.invitationLinks && Array.isArray(result.invitationLinks)) {
        console.log("Setting invitation links:", result.invitationLinks);
        setInvitationLinks(result.invitationLinks)
      } else {
        // Fallback: generate links manually if not provided
        console.warn("No invitation links returned from API, result:", result)
        setInvitationLinks([])
      }
      
      toast({
        title: "Success!",
        description: "Meeting created successfully",
      })
    } catch (error) {
      console.error("Meeting creation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create meeting. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubject("")
    setDetails("")
    setParticipants([
      { email: "", name: "" },
      { email: "", name: "" },
      { email: "", name: "" },
    ])
    setInvitationLinks([])
    setIsSubmitting(false)
  }

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (invitationLinks && invitationLinks.length > 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="p-6 sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">Meeting Created Successfully!</h1>
            <p className="mb-6 text-muted-foreground">
              Share these invitation links with your participants. Each participant needs to submit their input before
              the AI meeting can begin.
            </p>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Invitation Links</h2>
              {invitationLinks.map((item, index) => (
                <div key={index} className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-2 font-medium text-foreground">{item.email}</div>
                  <div className="flex items-center gap-2">
                    <Input value={item.link} readOnly className="flex-1 font-mono text-sm" />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(item.link, index)}
                      className="shrink-0"
                    >
                      {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={resetForm} variant="outline" className="w-full sm:w-auto bg-transparent">
                Create Another Meeting
              </Button>
              <Link href="/meetings" className="w-full sm:w-auto">
                <Button className="w-full">View All Meetings</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="p-6 sm:p-8">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Create New Meeting</h1>
          <p className="mb-6 text-muted-foreground">
            Set up your meeting topic and invite participants to provide their input
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">
                Meeting Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="e.g., Q4 Marketing Strategy"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">
                Meeting Details <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="details"
                placeholder="Describe the topic, context, and what you'd like to discuss..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>
                  Participants <span className="text-destructive">*</span>
                  <span className="ml-2 text-sm font-normal text-muted-foreground">(minimum 2)</span>
                </Label>
                <Button type="button" size="sm" variant="outline" onClick={addParticipant}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Participant
                </Button>
              </div>

              <div className="space-y-4">
                {participants.map((participant, index) => (
                  <div key={index} className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Participant {index + 1}</span>
                      {participants.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeParticipant(index)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor={`email-${index}`} className="text-sm">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          placeholder="participant@example.com"
                          value={participant.email}
                          onChange={(e) => updateParticipant(index, "email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`name-${index}`} className="text-sm">
                          Name <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          id={`name-${index}`}
                          placeholder="Full name"
                          value={participant.name || ""}
                          onChange={(e) => updateParticipant(index, "name", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Creating..." : "Create Meeting & Generate Links"}
              </Button>
              <Link href="/" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
