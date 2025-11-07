# Local Backend + Vercel Frontend Setup Guide

## Quick Start (Option A: ngrok - Recommended)

### Step 1: Install ngrok
1. Go to https://ngrok.com/download
2. Download and install ngrok
3. Sign up for free account
4. Run: `ngrok authtoken <your-token>` (from ngrok dashboard)

### Step 2: Start Your Backend
```bash
cd backend
npm start
```
Backend will run on http://localhost:4000

### Step 3: Expose Backend with ngrok
Open new terminal:
```bash
ngrok http 4000
```

You'll see output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:4000
```

### Step 4: Update Vercel Environment
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_BASE_URL` to: `https://abc123.ngrok.io`
3. Redeploy your frontend

### Step 5: Test
- Frontend: https://your-app.vercel.app
- Backend: https://abc123.ngrok.io/api/health

---

## Alternative: LocalTunnel (No signup required)

### Install LocalTunnel
```bash
npm install -g localtunnel
```

### Start Backend + Tunnel
Terminal 1:
```bash
cd backend
npm start
```

Terminal 2:
```bash
lt --port 4000 --subdomain a2mp-backend
```

You'll get: `https://a2mp-backend.loca.lt`

Update Vercel: `VITE_API_BASE_URL=https://a2mp-backend.loca.lt`

---

## Alternative: Cloudflare Tunnel

### Install Cloudflared
1. Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
2. Install cloudflared

### Start Tunnel
Terminal 1:
```bash
cd backend
npm start
```

Terminal 2:
```bash
cloudflared tunnel --url localhost:4000
```

Copy the tunnel URL and update Vercel environment.

---

## Benefits of Local Backend

✅ **Instant Updates** - No deployment time  
✅ **Easy Debugging** - See logs in real-time  
✅ **Free** - No hosting costs  
✅ **Full Control** - Access to database, files  
✅ **Fast Development** - Quick iteration cycle  

## Considerations

⚠️ **Computer Must Stay On** - Backend stops if computer sleeps  
⚠️ **Dynamic URLs** - Tunnel URLs may change (except with paid plans)  
⚠️ **Network Dependent** - Requires stable internet connection  

---

## Production Alternatives

When ready for production, consider:
- **Railway** (recommended, $5/month)
- **Render** (free tier available)
- **Heroku** ($7/month)
- **DigitalOcean App Platform**
- **AWS/GCP** (more complex)

---

## Environment Variables Summary

### Backend (.env):
```bash
CORS_ORIGIN=https://a2mp.vercel.app,https://*.ngrok.io
HOST_PASSWORD=12345
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
PORT=4000
DEV_MODE=true
```

### Frontend (Vercel):
```bash
VITE_API_BASE_URL=https://your-tunnel-url.ngrok.io
```

---

## Troubleshooting

### CORS Errors
- Make sure tunnel URL is in CORS_ORIGIN
- Restart backend after changing .env
- Check tunnel is working: visit `https://tunnel-url/api/health`

### Tunnel Not Working
- Check if port 4000 is actually running: `netstat -ano | findstr :4000`
- Try different tunnel service
- Check firewall settings

### Vercel Not Connecting
- Verify environment variable is saved
- Redeploy after changing environment variables
- Check browser network tab for actual request URLs