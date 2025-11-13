"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    p5: any
    VANTA: any
  }
}

export function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!vantaRef.current) return

    // Load p5.js
    const p5Script = document.createElement("script")
    p5Script.src = "/p5.min.js"
    p5Script.async = true

    // Load Vanta.js after p5.js
    const vantaScript = document.createElement("script")
    vantaScript.src = "/vanta.topology.min.js"
    vantaScript.async = true

    p5Script.onload = () => {
      document.body.appendChild(vantaScript)
    }

    vantaScript.onload = () => {
      if (window.VANTA && !vantaEffect.current) {
        vantaEffect.current = window.VANTA.TOPOLOGY({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x1800ad, // Logo blue color
          backgroundColor: 0x0a0514, // Darker background to match logo theme
        })
        // Trigger fade-in after a brief delay to ensure rendering
        setTimeout(() => setIsLoaded(true), 100)
      }
    }

    document.body.appendChild(p5Script)

    // Cleanup
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
      }
      // Remove scripts if needed
      if (p5Script.parentNode) {
        p5Script.parentNode.removeChild(p5Script)
      }
      if (vantaScript.parentNode) {
        vantaScript.parentNode.removeChild(vantaScript)
      }
    }
  }, [])

  return (
    <div
      ref={vantaRef}
      id="vanta-background"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
      style={{
        width: "100%",
        height: "100%",
        opacity: isLoaded ? 1 : 0,
      }}
    />
  )
}
