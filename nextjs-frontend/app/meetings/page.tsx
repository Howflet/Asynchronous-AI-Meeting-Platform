"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMeetings } from "@/lib/api"
import type { Meeting, MeetingStatus } from "@/lib/types"
import { StatusBadge } from "@/components/status-badge"
import { Calendar, Users, Plus, FileText, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<MeetingStatus | "all">("all")

  useEffect(() => {
    loadMeetings()
  }, [])

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredMeetings(meetings)
    } else {
      setFilteredMeetings(meetings.filter((m) => m.status === activeFilter))
    }
  }, [activeFilter, meetings])

  const loadMeetings = async () => {
    try {
      setIsLoading(true)
      const data = await getMeetings()
      // Sort by newest first
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setMeetings(sorted)
      setFilteredMeetings(sorted)
      setError(null)
    } catch (err) {
      setError("Failed to load meetings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getParticipantStatus = (meeting: Meeting) => {
    if (!meeting.participants || meeting.participants.length === 0) {
      return "No participants"
    }
    const submitted = meeting.participants.filter((p) => p.hasSubmitted).length
    const total = meeting.participants.length
    return `${submitted}/${total} submitted`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={loadMeetings}>Try Again</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Your Meetings</h1>
            <p className="text-muted-foreground">Manage and view all your AI-powered meetings</p>
          </div>
          <Link href="/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Meeting
            </Button>
          </Link>
        </div>

        <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as MeetingStatus | "all")} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="awaiting_inputs">Awaiting Inputs</TabsTrigger>
            <TabsTrigger value="running">Running</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredMeetings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No meetings found</h3>
            <p className="mb-6 text-muted-foreground">
              {activeFilter === "all"
                ? "Get started by creating your first meeting"
                : `No meetings with status "${activeFilter}"`}
            </p>
            {activeFilter === "all" && (
              <Link href="/create">
                <Button>Create Your First Meeting</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <Card key={meeting.id} className="p-6 transition-shadow hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-start gap-3">
                      <h3 className="text-xl font-semibold text-foreground">{meeting.subject}</h3>
                      <StatusBadge status={meeting.status} />
                    </div>
                    <p className="mb-4 line-clamp-2 text-muted-foreground">{meeting.details}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {meeting.createdAt ? formatDate(meeting.createdAt) : "Unknown date"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {getParticipantStatus(meeting)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {meeting.status === "completed" ? (
                      <Link href={`/meetings/${meeting.id}/report`}>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          View Report
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/meetings/${meeting.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
