import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Users, Clock, FileText, Sparkles, MessageSquare } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-sm font-medium text-white border border-white/20">
              <Sparkles className="h-4 w-4" />
              A²MP
            </div>
            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl lg:leading-[1.1]">
              Asynchronous AI Meeting Platform
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-pretty text-xl leading-relaxed text-white/90 drop-shadow-md sm:text-2xl">
              Conduct meaningful discussions with AI-generated personas representing your team members, moderated by an
              intelligent AI facilitator. Get insights without scheduling conflicts.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/create">
                <Button size="lg" className="w-full sm:w-auto bg-[#1800ad] hover:bg-[#1400a0] text-white">
                  Create New Meeting
                </Button>
              </Link>
              <Link href="/meetings">
                <Button size="lg" variant="outline" className="w-full bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-[#1800ad]/30 hover:text-white sm:w-auto">
                  View Past Meetings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl">
              Why Choose A²MP?
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-xl leading-relaxed text-white/80 drop-shadow-md">
              Transform how your team collaborates with AI-powered asynchronous meetings
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 transition-all hover:bg-white/15 hover:shadow-2xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30">
                <Clock className="h-7 w-7 text-blue-300" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">No Scheduling Required</h3>
              <p className="leading-relaxed text-white/70">
                Participants contribute on their own time. No more calendar conflicts or timezone headaches.
              </p>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 transition-all hover:bg-white/15 hover:shadow-2xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30">
                <Brain className="h-7 w-7 text-blue-300" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">AI-Powered Personas</h3>
              <p className="leading-relaxed text-white/70">
                Advanced AI creates authentic personas based on each participant's input and perspective.
              </p>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 transition-all hover:bg-white/15 hover:shadow-2xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30">
                <MessageSquare className="h-7 w-7 text-blue-300" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Intelligent Moderation</h3>
              <p className="leading-relaxed text-white/70">
                AI moderator facilitates productive discussions, asks clarifying questions, and keeps conversations on
                track.
              </p>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 transition-all hover:bg-white/15 hover:shadow-2xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30">
                <Users className="h-7 w-7 text-blue-300" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Inclusive Participation</h3>
              <p className="leading-relaxed text-white/70">
                Every voice is heard equally. Introverts and remote team members contribute without pressure.
              </p>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 transition-all hover:bg-white/15 hover:shadow-2xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30">
                <FileText className="h-7 w-7 text-blue-300" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Comprehensive Reports</h3>
              <p className="leading-relaxed text-white/70">
                Get detailed summaries, key decisions, action items, and full transcripts automatically generated.
              </p>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 transition-all hover:bg-white/15 hover:shadow-2xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30">
                <Sparkles className="h-7 w-7 text-blue-300" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Real-Time Insights</h3>
              <p className="leading-relaxed text-white/70">
                Watch the AI meeting unfold in real-time with live whiteboards tracking facts, decisions, and actions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-xl leading-relaxed text-white/80 drop-shadow-md">
              Get started with A²MP in three simple steps
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="relative">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1800ad] text-3xl font-bold text-white shadow-lg border-4 border-white/20">
                1
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-white">Create & Invite</h3>
              <p className="text-lg leading-relaxed text-white/70">
                Set up your meeting topic and invite participants via email. Each receives a unique link to provide
                their input.
              </p>
            </div>

            <div className="relative">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1800ad] text-3xl font-bold text-white shadow-lg border-4 border-white/20">
                2
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-white">AI Discussion</h3>
              <p className="text-lg leading-relaxed text-white/70">
                Once all inputs are received, AI personas engage in a moderated discussion representing each
                participant's perspective.
              </p>
            </div>

            <div className="relative">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1800ad] text-3xl font-bold text-white shadow-lg border-4 border-white/20">
                3
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-white">Review & Act</h3>
              <p className="text-lg leading-relaxed text-white/70">
                Receive a comprehensive report with key insights, decisions, and action items. Share with your team and
                move forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-white/60">
            A²MP - Asynchronous AI Meeting Platform
          </p>
        </div>
      </footer>
    </div>
  )
}
