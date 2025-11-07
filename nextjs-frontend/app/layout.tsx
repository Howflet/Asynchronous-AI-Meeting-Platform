import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"

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
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning prevents errors from browser extensions like Grammarly 
          that add attributes to both html and body elements after server-side rendering */}
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <Navigation />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
