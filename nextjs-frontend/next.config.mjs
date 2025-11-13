/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable standalone build for Docker
  output: 'standalone',
  // Configure environment variables
  env: {
    NEXT_PUBLIC_VITE_API_BASE_URL: process.env.NEXT_PUBLIC_VITE_API_BASE_URL || 'http://localhost:4000',
    NEXT_PUBLIC_HOST_PASSWORD: process.env.NEXT_PUBLIC_HOST_PASSWORD || '12345',
  },
  // Configure rewrites for API calls and WebSocket proxy
  async rewrites() {
    const backendUrl = 'http://localhost:4000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: '/socket.io/:path*',
        destination: `${backendUrl}/socket.io/:path*`
      }
    ]
  },
}

export default nextConfig
