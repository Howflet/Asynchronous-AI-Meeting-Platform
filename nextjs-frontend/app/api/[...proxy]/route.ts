// Next.js API route that catches all API requests and proxies to backend
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:4000'

export async function GET(request: NextRequest, context: any) {
  return handleProxy(request, 'GET', context)
}

export async function POST(request: NextRequest, context: any) {
  return handleProxy(request, 'POST', context)
}

export async function PUT(request: NextRequest, context: any) {
  return handleProxy(request, 'PUT', context)
}

export async function DELETE(request: NextRequest, context: any) {
  return handleProxy(request, 'DELETE', context)
}

export async function PATCH(request: NextRequest, context: any) {
  return handleProxy(request, 'PATCH', context)
}

async function handleProxy(request: NextRequest, method: string, context: any) {
  try {
    const url = new URL(request.url)
    
    // Extract the path after /api/
    let backendPath = url.pathname
    if (!backendPath.startsWith('/api/')) {
      backendPath = '/api' + backendPath
    }
    
    const backendUrl = `${BACKEND_URL}${backendPath}${url.search}`
    
    console.log(`[Proxy] ${method} ${url.pathname} -> ${backendUrl}`)
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
    }
    
    // Copy authorization and other important headers
    const authHeader = request.headers.get('Authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    }
    
    // Add body for methods that support it
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const contentType = request.headers.get('Content-Type')
        if (contentType?.includes('application/json')) {
          const body = await request.text()
          if (body) {
            options.body = body
          }
        }
      } catch (e) {
        console.log('No body to read or body read failed')
      }
    }
    
    // Make the request to backend
    const response = await fetch(backendUrl, options)
    
    console.log(`[Proxy] Backend response: ${response.status} ${response.statusText}`)
    
    // Get response data
    let responseData
    const contentType = response.headers.get('Content-Type')
    
    if (contentType?.includes('application/json')) {
      responseData = await response.text()
    } else {
      responseData = await response.text()
    }
    
    // Return response
    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
    
  } catch (error: any) {
    console.error('[Proxy] Error:', error.message)
    
    return NextResponse.json(
      { 
        error: 'Proxy Error', 
        message: error.message,
        details: 'Backend service unavailable' 
      },
      { 
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
}