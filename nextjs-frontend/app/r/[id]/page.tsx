"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, Copy, Check, FileText } from "lucide-react"
import { getMeetingReport } from "@/lib/api"
import type { MeetingReport } from "@/lib/types"
import Link from "next/link"

export default function ReportPage() {
  const params = useParams()
  const meetingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<MeetingReport | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadReport()
  }, [meetingId])

  const loadReport = async () => {
    try {
      const data = await getMeetingReport(meetingId)
      setReport(data)
    } catch (error) {
      console.error("Failed to load report:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!report) return

    const text = `
Meeting Report: ${report.subject}

Key Highlights:
${report.highlights.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Decisions Made:
${report.decisions.map((d, i) => `${i + 1}. ${d}`).join("\n")}

Action Items:
${report.actionItems.map((a, i) => `${i + 1}. ${a}`).join("\n")}
    `.trim()

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadReport = () => {
    if (!report) return

    const text = `
Meeting Report: ${report.subject}
Generated: ${new Date().toLocaleString()}

Key Highlights:
${report.highlights.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Decisions Made:
${report.decisions.map((d, i) => `${i + 1}. ${d}`).join("\n")}

Action Items:
${report.actionItems.map((a, i) => `${i + 1}. ${a}`).join("\n")}
    `.trim()

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meeting-report-${meetingId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-28">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 pt-28">
        <Card className="max-w-md p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Report Not Available</h1>
          <p className="text-muted-foreground">This meeting report could not be loaded.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-28">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Meeting Report</h1>
          <p className="text-muted-foreground">{report.subject}</p>
          <div className="flex gap-3 mt-4">
            <Button onClick={copyToClipboard} variant="outline" size="sm" className="bg-white/10 backdrop-blur-md border-white/30 hover:bg-[#1800ad]/30">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Report"}
            </Button>
            <Button onClick={downloadReport} variant="outline" size="sm" className="bg-white/10 backdrop-blur-md border-white/30 hover:bg-[#1800ad]/30">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button asChild variant="outline" size="sm" className="bg-white/10 backdrop-blur-md border-white/30 hover:bg-[#1800ad]/30">
              <Link href={`/m/${meetingId}`}>View Live Meeting</Link>
            </Button>
          </div>
        </div>



        {/* Highlights */}
        {report.highlights && report.highlights.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Key Highlights</h2>
            <ol className="space-y-3">
              {report.highlights.map((highlight, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-semibold text-primary min-w-[24px]">{index + 1}.</span>
                  <span className="text-foreground">{highlight}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* Decisions */}
        {report.decisions && report.decisions.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Decisions Made</h2>
            <ol className="space-y-3">
              {report.decisions.map((decision, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-semibold text-green-400 min-w-[24px]">{index + 1}.</span>
                  <span className="text-foreground">{decision}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* Action Items */}
        {report.actionItems && report.actionItems.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Action Items</h2>
            <ol className="space-y-3">
              {report.actionItems.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-semibold text-orange-400 min-w-[24px]">{index + 1}.</span>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}


      </div>
    </div>
  )
}
