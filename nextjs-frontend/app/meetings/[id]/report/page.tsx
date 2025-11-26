"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getMeetingReport, getMeetingStatus } from "@/lib/api"
import type { MeetingReport, Citation } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Download, Copy, Check, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function MeetingReportPage() {
  const params = useParams()
  const meetingId = params.id as string
  const { toast } = useToast()

  const [report, setReport] = useState<MeetingReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [personaNames, setPersonaNames] = useState<Record<string, string>>({})

  useEffect(() => {
    loadReport()
  }, [meetingId])

  const loadReport = async () => {
    try {
      setIsLoading(true)
      const [data, status] = await Promise.all([
        getMeetingReport(meetingId),
        getMeetingStatus(meetingId).catch(() => null),
      ])
      setReport(data)
      if (status && Array.isArray(status.personas)) {
        const map: Record<string, string> = {}
        status.personas.forEach((p: any) => {
          if (p?.id) map[p.id] = p.name || p.role || `Persona ${p.id.slice(0, 4)}`
        })
        setPersonaNames(map)
      } else {
        setPersonaNames({})
      }
      setError(null)
    } catch (err) {
      setError("Failed to load report. The meeting may not be completed yet.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
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

  const copyToClipboard = async () => {
    if (!report) return

    const reportText = `
MEETING REPORT
${report.subject}
${formatDate(report.date)}

KEY HIGHLIGHTS
${report.highlights.map((h, i) => `${i + 1}. ${h}`).join("\n")}

DECISIONS MADE
${report.decisions.map((d, i) => `${i + 1}. ${d}`).join("\n")}

ACTION ITEMS
${report.actionItems.map((a, i) => `${i + 1}. ${a}`).join("\n")}
    `.trim()

    try {
      await navigator.clipboard.writeText(reportText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Report copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy report",
        variant: "destructive",
      })
    }
  }

  const downloadReport = () => {
    if (!report) return

    const reportText = `
MEETING REPORT
${report.subject}
${formatDate(report.date)}

KEY HIGHLIGHTS
${report.highlights.map((h, i) => `${i + 1}. ${h}`).join("\n")}

DECISIONS MADE
${report.decisions.map((d, i) => `${i + 1}. ${d}`).join("\n")}

ACTION ITEMS
${report.actionItems.map((a, i) => `${i + 1}. ${a}`).join("\n")}

SOURCES & CITATIONS
${(report.citations || [])
        .map((c) => `- ${c.title ? `${c.title} — ` : ""}${c.url}`)
        .join("\n")}
    `.trim()

    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meeting-report-${meetingId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded!",
      description: "Report downloaded successfully",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 pt-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-8 w-64" />
          <Card className="p-8">
            <Skeleton className="mb-4 h-10 w-3/4" />
            <Skeleton className="mb-8 h-6 w-1/4" />
            <Skeleton className="mb-4 h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background py-12 pt-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <p className="mb-4 text-destructive">{error || "Report not found"}</p>
            <Link href={`/meetings/${meetingId}`}>
              <Button className="bg-[#1800ad] hover:bg-[#1400a0] text-white">Back to Meeting</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 pt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href={`/meetings/${meetingId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meeting
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-foreground">Meeting Report</h1>
            <p className="text-muted-foreground">{formatDate(report.date)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="bg-white/10 backdrop-blur-md border-white/30 hover:bg-[#1800ad]/30">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadReport} className="bg-white/10 backdrop-blur-md border-white/30 hover:bg-[#1800ad]/30">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Subject */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground">{report.subject}</h2>
          </Card>



          {/* Key Highlights */}
          {report.highlights.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Key Highlights</h3>
              <ol className="space-y-3">
                {report.highlights.map((highlight, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed text-foreground">{highlight}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {/* Decisions Made */}
          {report.decisions.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Decisions Made</h3>
              <ul className="space-y-2">
                {report.decisions.map((decision, index) => (
                  <li key={index} className="flex gap-2 leading-relaxed text-foreground">
                    <span className="text-primary">•</span>
                    <span>{decision}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Action Items */}
          {report.actionItems.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Action Items</h3>
              <ul className="space-y-3">
                {report.actionItems.map((item, index) => (
                  <li key={index} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed text-foreground">{item}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}


          {/* Sources & Citations */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Sources & Citations</h3>
            {report.citations && report.citations.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(groupCitationsByPersona(report.citations)).map(([personaId, cites]) => (
                  <Collapsible key={personaId} defaultOpen>
                    <div className="rounded-lg border border-border bg-card">
                      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 font-medium hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {personaNames[personaId] || `Persona ${personaId.slice(0, 4)}`}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {cites.length}
                          </span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t border-border p-4 pt-0 mt-4">
                          <ul className="space-y-3">
                            {cites.map((c, idx) => (
                              <li key={`${c.id}-${idx}`} className="rounded-lg border border-border bg-muted/20 p-3">
                                <div className="flex flex-col">
                                  <a
                                    href={c.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary hover:underline break-words"
                                  >
                                    {c.title || c.url}
                                  </a>
                                  {c.snippet && (
                                    <p className="mt-1 text-sm text-muted-foreground">{c.snippet}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No external sources were cited for this meeting.</p>
            )}
          </Card>



          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/meetings" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full bg-white/10 backdrop-blur-md border-white/30 hover:bg-[#1800ad]/30">
                Back to All Meetings
              </Button>
            </Link>
            <Link href="/create" className="w-full sm:w-auto">
              <Button className="w-full bg-[#1800ad] hover:bg-[#1400a0] text-white">Create New Meeting</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function groupCitationsByPersona(citations: Citation[]): Record<string, Citation[]> {
  return (citations || []).reduce((acc, c) => {
    const key = c.persona_id || "unknown"
    acc[key] = acc[key] || []
    acc[key].push(c)
    return acc
  }, {} as Record<string, Citation[]>)
}
