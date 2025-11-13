import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:4000'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/api/meetings${url.search}`
    
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      if (!['host', 'connection'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    })
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    })
    
    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Backend proxy error:', error)
    return NextResponse.json(
      { error: 'Backend unavailable' },
      { status: 503 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/api/meetings${url.search}`
    
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      if (!['host', 'connection'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    })
    
    const body = await request.text()
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: body || undefined,
    })
    
    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Backend proxy error:', error)
    return NextResponse.json(
      { error: 'Backend unavailable' },
      { status: 503 }
    )
  }
}