"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function HostPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem("hostAuthenticated")
    if (auth === "true") {
      setIsAuthenticated(true)
      router.push("/meetings")
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "12345") {
      setIsAuthenticated(true)
      localStorage.setItem("hostAuthenticated", "true")
      setLoginError("")
      router.push("/meetings")
    } else {
      setLoginError("Invalid password")
    }
  }

  // Login screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pt-28">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Host Dashboard</h1>
          <p className="text-muted-foreground">Enter password to access admin panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter host password"
              className="mt-1"
            />
            {loginError && <p className="text-sm text-red-600 mt-1">{loginError}</p>}
          </div>

          <Button type="submit" className="w-full bg-[#1800ad] hover:bg-[#1400a0] text-white">
            Login
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Default password: 12345</p>
        </div>
      </Card>
    </div>
  )
}
