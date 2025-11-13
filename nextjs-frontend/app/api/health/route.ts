import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:4000'

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`)
    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Health check proxy error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Backend unavailable' },
      { status: 503 }
    )
  }
}