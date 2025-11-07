"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                A²
              </div>
              <span className="text-xl font-bold text-foreground">A²MP</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button variant={isActive("/") ? "secondary" : "ghost"} size="sm">
                  Home
                </Button>
              </Link>
              <Link href="/meetings">
                <Button variant={isActive("/meetings") ? "secondary" : "ghost"} size="sm">
                  Meetings
                </Button>
              </Link>
              <Link href="/create">
                <Button variant={isActive("/create") ? "secondary" : "ghost"} size="sm">
                  Create
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive("/") ? "secondary" : "ghost"} size="sm" className="w-full justify-start">
                Home
              </Button>
            </Link>
            <Link href="/meetings" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={isActive("/meetings") ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
              >
                Meetings
              </Button>
            </Link>
            <Link href="/create" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive("/create") ? "secondary" : "ghost"} size="sm" className="w-full justify-start">
                Create
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
