"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <div className="relative h-[60px] w-[60px]">
                <Image 
                  src="/logo.png" 
                  alt="A²MP Logo" 
                  width={60} 
                  height={60}
                  className="object-cover w-full h-full"
                  priority
                  unoptimized
                />
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/meetings">
                <Button 
                  variant={isActive("/meetings") ? "secondary" : "ghost"} 
                  size="sm"
                  className={isActive("/meetings") ? "bg-white/20 text-white hover:bg-white/30" : "text-white/80 hover:text-white hover:bg-white/10"}
                >
                  Meetings
                </Button>
              </Link>
              <Link href="/create">
                <Button 
                  variant={isActive("/create") ? "secondary" : "ghost"} 
                  size="sm"
                  className={isActive("/create") ? "bg-white/20 text-white hover:bg-white/30" : "text-white/80 hover:text-white hover:bg-white/10"}
                >
                  Create
                </Button>
              </Link>
              <Link href="/story">
                <Button 
                  variant={isActive("/story") ? "secondary" : "ghost"} 
                  size="sm"
                  className={isActive("/story") ? "bg-white/20 text-white hover:bg-white/30" : "text-white/80 hover:text-white hover:bg-white/10"}
                >
                  Our Story
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link href="/meetings" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={isActive("/meetings") ? "secondary" : "ghost"}
                size="sm"
                className={`w-full justify-start ${isActive("/meetings") ? "bg-white/20 text-white hover:bg-white/30" : "text-white/80 hover:text-white hover:bg-white/10"}`}
              >
                Meetings
              </Button>
            </Link>
            <Link href="/create" onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant={isActive("/create") ? "secondary" : "ghost"} 
                size="sm" 
                className={`w-full justify-start ${isActive("/create") ? "bg-white/20 text-white hover:bg-white/30" : "text-white/80 hover:text-white hover:bg-white/10"}`}
              >
                Create
              </Button>
            </Link>
            <Link href="/story" onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant={isActive("/story") ? "secondary" : "ghost"} 
                size="sm" 
                className={`w-full justify-start ${isActive("/story") ? "bg-white/20 text-white hover:bg-white/30" : "text-white/80 hover:text-white hover:bg-white/10"}`}
              >
                Our Story
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
