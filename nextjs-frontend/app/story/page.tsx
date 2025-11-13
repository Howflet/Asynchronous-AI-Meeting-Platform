"use client"

import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-background py-12 pt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-8">
          The Story Behind A²MP: When Meetings Could Have Been an Email
        </h1>

        <Card className="p-8">
          <article className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-foreground mb-4">The Spark</h2>
            <p className="text-foreground leading-relaxed mb-4">
              The inspiration for A²MP came from a place we've all been: a pointless meeting.
            </p>
            <p className="text-foreground leading-relaxed mb-4">
              I was in a weekly team check-in meeting during an internship with two of my teammates. About ten minutes in, one of them sighed and said the one thing every professional feels: "This really could have been an email." We all laughed, but it sparked a real discussion.
            </p>
            <p className="text-foreground leading-relaxed">
              The problem wasn't that the topic was useless; we did need to align, but the format was broken. That's when I remembered an old episode of Black Mirror. In the show, a dating app runs thousands of complex simulations to determine a couple's perfect match, all before they even meet.
            </p>
            <p className="text-foreground leading-relaxed font-semibold mt-4">
              The idea clicked!
            </p>
            <p className="text-foreground leading-relaxed">
              What if we applied that same simulation concept to the workplace? What if, instead of running simulations to find a "perfect match," we could run a simulation to find a "perfect decision"?
            </p>
            <p className="text-foreground leading-relaxed">
              Could we build a tool where everyone submits their detailed, asynchronous input, and AI agents representing our unique goals hold the meeting for us? This project is the first step toward that answer.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-12">The Vision</h2>
            <p className="text-foreground leading-relaxed mb-4">
              The idea consumed me. I imagined a world where:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-foreground leading-relaxed">
                A product manager in San Francisco could have their AI persona debate feature priorities with an engineering lead's persona in Berlin
              </li>
              <li className="text-foreground leading-relaxed">
                Budget discussions could happen between AI representatives of different departments, working through constraints and trade-offs
              </li>
              <li className="text-foreground leading-relaxed">
                Strategic decisions could emerge from AI-mediated conversations that considered everyone's input, even when they couldn't all be in the same room
              </li>
            </ul>
            <p className="text-foreground leading-relaxed">
              This wasn't about replacing human judgment – it was about <strong>augmenting human collaboration</strong>.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-12">The Technical Challenge</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Persona Generation</h3>
              <p className="text-foreground leading-relaxed mb-2">
                How do you capture someone's perspective, priorities, and communication style in an AI agent? I developed a system that analyzes participant inputs to generate unique personas with:
              </p>
              <ul className="space-y-1 ml-6">
                <li className="text-foreground">Identity and role descriptions</li>
                <li className="text-foreground">Specific objectives and constraints</li>
                <li className="text-foreground">Natural communication patterns</li>
                <li className="text-foreground">Decision-making frameworks</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Real-Time Conversation Engine</h3>
              <p className="text-foreground leading-relaxed mb-2">
                The heart of A²MP is its conversation engine that:
              </p>
              <ul className="space-y-1 ml-6">
                <li className="text-foreground">Orchestrates turn-taking between AI personas</li>
                <li className="text-foreground">Detects when conversations are getting stuck in loops</li>
                <li className="text-foreground">Manages the flow from discussion to consensus</li>
                <li className="text-foreground">Pauses for human intervention when needed</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Moderation</h3>
              <p className="text-foreground leading-relaxed mb-2">
                I implemented an AI moderator that uses sophisticated logic to decide who speaks next:
              </p>
              <ul className="space-y-1 ml-6">
                <li className="text-foreground">Prioritizes direct responses to questions</li>
                <li className="text-foreground">Ensures everyone gets a chance to contribute</li>
                <li className="text-foreground">Alternates speakers to maintain natural flow</li>
                <li className="text-foreground">Recognizes when human guidance is needed</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-12">The Technology Stack</h2>
            <p className="text-foreground leading-relaxed mb-4">
              I chose modern, robust technologies to bring this vision to life:
            </p>
            <ul className="space-y-2">
              <li className="text-foreground leading-relaxed">
                <strong>Backend</strong>: Node.js with Express and TypeScript for type-safe, scalable APIs
              </li>
              <li className="text-foreground leading-relaxed">
                <strong>Frontend</strong>: Next.js 14 with React for a responsive, real-time user interface
              </li>
              <li className="text-foreground leading-relaxed">
                <strong>Real-time Communication</strong>: Socket.IO for seamless WebSocket connections
              </li>
              <li className="text-foreground leading-relaxed">
                <strong>AI Integration</strong>: Google Gemini 2.5 Flash for powerful language understanding
              </li>
              <li className="text-foreground leading-relaxed">
                <strong>Database</strong>: SQLite for reliable, file-based persistence
              </li>
              <li className="text-foreground leading-relaxed">
                <strong>UI Components</strong>: Tailwind CSS with custom components for a polished experience
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-12">The Challenges</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Rate Limiting & Quota Management</h3>
                <p className="text-foreground leading-relaxed">
                  AI APIs have strict rate limits, so I implemented a dual-key system that separates persona responses from moderation decisions, effectively doubling our capacity to 500+ requests per day.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Repetition Detection</h3>
                <p className="text-foreground leading-relaxed">
                  Early versions would sometimes get stuck in conversational loops. I built sophisticated pattern detection that identifies when personas are repeating themselves and automatically pauses for human intervention.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Real-Time Synchronization</h3>
                <p className="text-foreground leading-relaxed">
                  Keeping multiple clients synchronized during live conversations required careful WebSocket management and state synchronization across the entire application.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Natural Turn-Taking</h3>
                <p className="text-foreground leading-relaxed">
                  Creating conversations that feel natural rather than robotic required implementing priority logic that mimics human conversation patterns – responding to direct questions, alternating speakers, and managing interruptions gracefully.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-12">The Lessons</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Technical Insights</h3>
              <ul className="space-y-2">
                <li className="text-foreground leading-relaxed">
                  <strong>AI Orchestration</strong>: Managing multiple AI agents in real-time conversations is as much about conversation design as it is about technical implementation
                </li>
                <li className="text-foreground leading-relaxed">
                  <strong>WebSocket Architecture</strong>: Real-time collaboration requires careful consideration of connection management, room-based broadcasting, and graceful error handling
                </li>
                <li className="text-foreground leading-relaxed">
                  <strong>Persona Design</strong>: The quality of AI conversations depends heavily on how well you capture and model individual perspectives and communication styles
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Product Insights</h3>
              <ul className="space-y-2">
                <li className="text-foreground leading-relaxed">
                  <strong>Asynchronous Collaboration</strong>: There's enormous untapped potential in tools that work across time zones and schedules
                </li>
                <li className="text-foreground leading-relaxed">
                  <strong>AI Augmentation</strong>: The most powerful AI applications don't replace humans – they amplify human capabilities and remove friction from collaboration
                </li>
                <li className="text-foreground leading-relaxed">
                  <strong>Trust & Transparency</strong>: Users need to understand and trust how their personas are representing them, requiring clear visualization of AI decision-making
                </li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-12">The Impact</h2>
            <p className="text-foreground leading-relaxed mb-4">
              A²MP transforms how distributed teams make decisions. Instead of:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-foreground">Scheduling conflicts across time zones</li>
              <li className="text-foreground">Rushed decisions in time-constrained meetings</li>
              <li className="text-foreground">Quiet voices getting overshadowed</li>
              <li className="text-foreground">"This could have been an email" frustration</li>
            </ul>
            <p className="text-foreground leading-relaxed mb-2">We enable:</p>
            <ul className="space-y-2">
              <li className="text-foreground leading-relaxed">
                <strong>Asynchronous consensus-building</strong> that respects everyone's schedule
              </li>
              <li className="text-foreground leading-relaxed">
                <strong>Thoughtful AI-mediated discussions</strong> that consider all perspectives
              </li>
              <li className="text-foreground leading-relaxed">
                <strong>Automatic documentation</strong> with complete transcripts and decision summaries
              </li>
              <li className="text-foreground leading-relaxed">
                <strong>Equitable participation</strong> where every voice is heard and represented
              </li>
            </ul>

            <div className="-mx-8 px-8 pt-8 pb-8 mt-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">The Future</h2>
              <p className="text-foreground leading-relaxed mb-4">
              This project opened my eyes to the transformative potential of AI in collaborative work. A²MP is just the beginning – imagine AI personas that:
            </p>
            <ul className="space-y-2">
              <li className="text-foreground">Learn and adapt from past decisions</li>
              <li className="text-foreground">Integrate with existing business tools and data</li>
              <li className="text-foreground">Derive rich context from productivity platforms like Notion and Obsidian</li>
              <li className="text-foreground">Handle complex multi-stakeholder negotiations</li>
              <li className="text-foreground">Provide insights into team dynamics and decision patterns</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4 font-semibold">
              The future of work isn't just about working from anywhere – it's about working <strong>anytime</strong>, with AI as our collaborative partner.
            </p>
            </div>
          </article>
        </Card>
      </div>
    </div>
  )
}
