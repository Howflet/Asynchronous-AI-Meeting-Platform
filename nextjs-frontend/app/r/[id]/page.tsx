"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Download, Copy, Check, ChevronDown, ChevronUp, FileText } from "lucide-react"
import { getMeetingReport } from "@/lib/api"
import type { MeetingReport } from "@/lib/types"
import Link from "next/link"

export default function ReportPage() {
  const params = useParams()
  const meetingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<MeetingReport | null>(null)
  const [showFullTranscript, setShowFullTranscript] = useState(false)
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

Summary:
${report.summary}

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

Summary:
${report.summary}

Key Highlights:
${report.highlights.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Decisions Made:
${report.decisions.map((d, i) => `${i + 1}. ${d}`).join("\n")}

Action Items:
${report.actionItems.map((a, i) => `${i + 1}. ${a}`).join("\n")}

Full Transcript:
${report.transcript}
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="max-w-md p-8 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Report Not Available</h1>
          <p className="text-slate-600">This meeting report could not be loaded.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Meeting Report</h1>
          <p className="text-slate-600">{report.subject}</p>
          <div className="flex gap-3 mt-4">
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Report"}
            </Button>
            <Button onClick={downloadReport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/m/${meetingId}`}>View Live Meeting</Link>
            </Button>
          </div>
        </div>

        {/* Summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Executive Summary</h2>
          <p className="text-slate-700 leading-relaxed">{report.summary}</p>
        </Card>

        {/* Highlights */}
        {report.highlights && report.highlights.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Key Highlights</h2>
            <ol className="space-y-3">
              {report.highlights.map((highlight, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-semibold text-blue-600 min-w-[24px]">{index + 1}.</span>
                  <span className="text-slate-700">{highlight}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* Decisions */}
        {report.decisions && report.decisions.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Decisions Made</h2>
            <ol className="space-y-3">
              {report.decisions.map((decision, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-semibold text-green-600 min-w-[24px]">{index + 1}.</span>
                  <span className="text-slate-700">{decision}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* Action Items */}
        {report.actionItems && report.actionItems.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Action Items</h2>
            <ol className="space-y-3">
              {report.actionItems.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-semibold text-orange-600 min-w-[24px]">{index + 1}.</span>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* Full Transcript */}
        {report.transcript && (
          <Card className="p-6">
            <button
              onClick={() => setShowFullTranscript(!showFullTranscript)}
              className="w-full flex items-center justify-between text-left"
            >
              <h2 className="text-2xl font-semibold text-slate-900">Full Transcript</h2>
              {showFullTranscript ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showFullTranscript && (
              <div className="mt-4 pt-4 border-t">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {report.transcript}
                </pre>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
