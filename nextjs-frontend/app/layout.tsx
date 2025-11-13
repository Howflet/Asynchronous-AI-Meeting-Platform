import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { VantaBackground } from "@/components/vanta-background"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "A²MP - AI-Powered Asynchronous Meetings",
  description: "Conduct meaningful discussions with AI-generated personas representing your team members",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning style={{ backgroundColor: 'oklch(0.1 0.01 250)' }}>
      {/* suppressHydrationWarning prevents errors from browser extensions like Grammarly 
          that add attributes to both html and body elements after server-side rendering */}
      <body className={`font-sans antialiased bg-background text-foreground`} suppressHydrationWarning style={{ backgroundColor: 'oklch(0.1 0.01 250)' }}>
        <VantaBackground />
        <div className="relative z-10">
          <Navigation />
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
