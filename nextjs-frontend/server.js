const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { createProxyMiddleware } = require('http-proxy-middleware')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname } = parsedUrl

      // Handle Socket.IO requests by proxying to backend
      if (pathname.startsWith('/socket.io/')) {
        const proxy = createProxyMiddleware({
          target: 'http://localhost:4000',
          changeOrigin: true,
          ws: true, // Enable WebSocket proxying
          logLevel: 'debug',
        })
        
        return proxy(req, res)
      }

      // Handle all other requests with Next.js
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Handle WebSocket upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url)
    
    if (pathname.startsWith('/socket.io/')) {
      const proxy = createProxyMiddleware({
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug',
      })
      
      proxy.upgrade(request, socket, head)
    } else {
      socket.destroy()
    }
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})