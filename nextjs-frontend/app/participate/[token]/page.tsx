"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getParticipantInfo, submitParticipantInput } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ParticipateInputPage() {
  const params = useParams()
  const token = params.token as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState("")
  const [participantEmail, setParticipantEmail] = useState("")
  const [meetingSubject, setMeetingSubject] = useState("")
  const [meetingDetails, setMeetingDetails] = useState("")
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    loadParticipantInfo()
  }, [token])

  const loadParticipantInfo = async () => {
    try {
      setIsLoading(true)
      const data = await getParticipantInfo(token)
      setParticipantName(data.participant.name || data.participant.email)
      setParticipantEmail(data.participant.email)
      setMeetingSubject(data.meeting.subject)
      setMeetingDetails(data.meeting.details)
      setAlreadySubmitted(data.participant.hasSubmitted || false)
      setError(null)
    } catch (err) {
      setError("Invalid or expired invitation link. Please contact the meeting organizer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (input.trim().length < 50) {
      toast({
        title: "Input too short",
        description: "Please provide at least 50 characters of input to help create a meaningful AI persona.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await submitParticipantInput(token, input)
      toast({
        title: "Success!",
        description: "Your input has been submitted successfully. Redirecting to live view...",
      })
      // Redirect to live view after successful submission
      window.location.href = `/participate/${token}/live`
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit input. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="p-6 sm:p-8">
            <Skeleton className="mb-4 h-8 w-3/4" />
            <Skeleton className="mb-6 h-20 w-full" />
            <Skeleton className="mb-4 h-6 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </Card>
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

  if (alreadySubmitted) {
    // Redirect to live view if already submitted
    window.location.href = `/participate/${token}/live`
    return (
      <div className="min-h-screen bg-background py-12 pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">Redirecting...</h2>
            <p className="mb-4 text-muted-foreground">
              Taking you to the live meeting view...
            </p>
          </Card>
        </div>
      </div>
    )
  }

  const charCount = input.length
  const minChars = 50
  const recommendedChars = 100

  return (
    <div className="min-h-screen bg-background py-12 pt-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Card className="p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold text-foreground">Meeting Input Request</h1>
            <p className="text-muted-foreground">
              You've been invited to provide input for an AI-powered asynchronous meeting
            </p>
          </div>

          <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
            <h2 className="mb-2 text-lg font-semibold text-foreground">{meetingSubject}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{meetingDetails}</p>
          </div>

          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm leading-relaxed text-foreground">
              <strong>Welcome, {participantName}!</strong> Your input will be used to create an AI persona that
              represents your perspective in the meeting discussion. Please share your thoughts, priorities, concerns,
              and any relevant context about this topic.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="input">
                Your Perspective & Input <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="input"
                placeholder="Share your perspective, priorities, and thoughts on this topic. Be as detailed as possible to help create an accurate AI representation of your viewpoint..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={12}
                className="resize-none"
                required
              />
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`${
                    charCount < minChars
                      ? "text-destructive"
                      : charCount < recommendedChars
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {charCount} characters
                  {charCount < minChars && ` (minimum ${minChars})`}
                  {charCount >= minChars && charCount < recommendedChars && ` (${recommendedChars} recommended)`}
                </span>
                {charCount >= recommendedChars && (
                  <span className="text-green-600 dark:text-green-400">Great detail!</span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Tips for effective input:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Share your main priorities and concerns about this topic</li>
                <li>• Mention any constraints or requirements you're aware of</li>
                <li>• Include relevant background or context from your perspective</li>
                <li>• Express any questions or areas where you need clarity</li>
              </ul>
            </div>

            <Button type="submit" disabled={isSubmitting || charCount < minChars} className="w-full sm:w-auto bg-[#1800ad] hover:bg-[#1400a0] text-white">
              {isSubmitting ? "Submitting..." : "Submit Input"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
