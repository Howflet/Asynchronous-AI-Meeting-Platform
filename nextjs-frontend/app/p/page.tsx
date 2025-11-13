"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

function ParticipantPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      // Redirect to new URL format
      router.replace(`/participate/${token}`)
    } else {
      // No token provided, redirect to home
      router.replace("/")
    }
  }, [token, router])

  // Show loading skeleton while redirecting
  return (
    <div className="min-h-screen bg-background py-12 pt-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8">
          <Skeleton className="mb-4 h-8 w-3/4" />
          <Skeleton className="mb-6 h-20 w-full" />
          <Skeleton className="mb-4 h-6 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function ParticipantPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background py-12 pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8">
            <Skeleton className="mb-4 h-8 w-3/4" />
            <Skeleton className="mb-6 h-20 w-full" />
            <Skeleton className="mb-4 h-6 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    }>
      <ParticipantPageContent />
    </Suspense>
  )
}
