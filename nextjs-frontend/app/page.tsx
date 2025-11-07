import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Users, Clock, FileText, Sparkles, MessageSquare } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Meeting Platform
            </div>
            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl lg:leading-[1.1]">
              Asynchronous AI Meeting Platform
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-pretty text-xl leading-relaxed text-muted-foreground sm:text-2xl">
              Conduct meaningful discussions with AI-generated personas representing your team members, moderated by an
              intelligent AI facilitator. Get insights without scheduling conflicts.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/create">
                <Button size="lg" className="w-full sm:w-auto">
                  Create New Meeting
                </Button>
              </Link>
              <Link href="/meetings">
                <Button size="lg" variant="outline" className="w-full bg-transparent sm:w-auto">
                  View Past Meetings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Why Choose A²MP?
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-xl leading-relaxed text-muted-foreground">
              Transform how your team collaborates with AI-powered asynchronous meetings
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-8 transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">No Scheduling Required</h3>
              <p className="leading-relaxed text-muted-foreground">
                Participants contribute on their own time. No more calendar conflicts or timezone headaches.
              </p>
            </Card>

            <Card className="p-8 transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Brain className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">AI-Powered Personas</h3>
              <p className="leading-relaxed text-muted-foreground">
                Advanced AI creates authentic personas based on each participant's input and perspective.
              </p>
            </Card>

            <Card className="p-8 transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Intelligent Moderation</h3>
              <p className="leading-relaxed text-muted-foreground">
                AI moderator facilitates productive discussions, asks clarifying questions, and keeps conversations on
                track.
              </p>
            </Card>

            <Card className="p-8 transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Inclusive Participation</h3>
              <p className="leading-relaxed text-muted-foreground">
                Every voice is heard equally. Introverts and remote team members contribute without pressure.
              </p>
            </Card>

            <Card className="p-8 transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Comprehensive Reports</h3>
              <p className="leading-relaxed text-muted-foreground">
                Get detailed summaries, key decisions, action items, and full transcripts automatically generated.
              </p>
            </Card>

            <Card className="p-8 transition-all hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Real-Time Insights</h3>
              <p className="leading-relaxed text-muted-foreground">
                Watch the AI meeting unfold in real-time with live whiteboards tracking facts, decisions, and actions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-border bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-xl leading-relaxed text-muted-foreground">
              Get started with A²MP in three simple steps
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="relative">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
                1
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-foreground">Create & Invite</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Set up your meeting topic and invite participants via email. Each receives a unique link to provide
                their input.
              </p>
            </div>

            <div className="relative">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
                2
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-foreground">AI Discussion</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Once all inputs are received, AI personas engage in a moderated discussion representing each
                participant's perspective.
              </p>
            </div>

            <div className="relative">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
                3
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-foreground">Review & Act</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Receive a comprehensive report with key insights, decisions, and action items. Share with your team and
                move forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Ready to Transform Your Meetings?
          </h2>
          <p className="mb-10 text-pretty text-xl leading-relaxed text-muted-foreground">
            Start your first AI-powered asynchronous meeting today
          </p>
          <Link href="/create">
            <Button size="lg" className="text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
