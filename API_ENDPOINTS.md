# A²MP API Endpoints Reference

## 🏠 Local Backend Setup
This API reference is for a **locally running backend** that's exposed via tunneling services.

### Quick Start:
1. **Start Backend:** `cd backend && npm start` (runs on port 4000)
2. **Start Tunnel:** Use ngrok, localtunnel, or cloudflare tunnel
3. **Update Vercel:** Set `VITE_API_BASE_URL` to your tunnel URL

## Base URL
- **Local Development:** `http://localhost:4000`
- **Local with Tunnel:** `https://your-tunnel-url.ngrok.io` or `https://your-subdomain.loca.lt`
- **Current Tunnel:** `https://ninety-bags-thank.loca.lt` (from your .env)

## 🚀 Starting Local Backend

### Option 1: Manual Start
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start tunnel (choose one)
ngrok http 4000
# OR
lt --port 4000 --subdomain your-app
# OR  
cloudflared tunnel --url localhost:4000
```

### Option 2: Automated (Windows)
```bash
# Run the setup script
./start-local-backend.bat
```

## Authentication
Most endpoints require JWT authentication with `Authorization: Bearer <token>` header.
- **Host Password:** `12345` (from your .env)
- **Login to get JWT:** `POST /api/auth/login`

---

## 🔐 Authentication Endpoints

### POST `/api/auth/login`
**Description:** Authenticate as host and get JWT token  
**Authentication:** None required  
**Body:**
```json
{
  "password": "your-host-password"
}
```
**Response:**
```json
{
  "token": "jwt-token-string"
}
```

---

## 🏥 System Endpoints

### GET `/api/health`
**Description:** Health check endpoint  
**Authentication:** None required  
**Response:**
```json
{
  "ok": true
}
```

### GET `/api/system/status`
**Description:** Get rate limiter and queue status (monitoring)  
**Authentication:** Host token required  
**Response:**
```json
{
  "rateLimiter": { ... },
  "personaQueue": { ... }
}
```

---

## 🎯 Meeting Management Endpoints

### POST `/api/meetings`
**Description:** Create a new meeting and send invitations  
**Authentication:** Host token required  
**Body:**
```json
{
  "subject": "Meeting Subject",
  "details": "Meeting details and topics",
  "participants": ["email1@example.com", "email2@example.com"],
  "participantBaseUrl": "https://a2mp.vercel.app/p"
}
```
**Response:**
```json
{
  "id": "meeting-uuid",
  "subject": "Meeting Subject",
  "details": "Meeting details",
  "participants": [
    { "id": "participant-id", "email": "email1@example.com" }
  ]
}
```

### GET `/api/meetings/:id/status`
**Description:** Get meeting status, whiteboard, and conversation history  
**Authentication:** None required  
**Response:**
```json
{
  "status": "running|paused|completed|awaiting_inputs",
  "whiteboard": {
    "keyFacts": ["fact1", "fact2"],
    "decisions": ["decision1"],
    "actionItems": ["action1"]
  },
  "history": [
    {
      "id": "turn-id",
      "speaker": "PersonaName",
      "message": "Turn content",
      "createdAt": "2025-11-07T..."
    }
  ]
}
```

### GET `/api/meetings/:id/participants`
**Description:** Get all participants for a meeting (debug endpoint)  
**Authentication:** Host token required  
**Response:**
```json
{
  "participants": [
    {
      "id": "participant-id",
      "email": "participant@example.com",
      "token": "participant-token",
      "hasSubmitted": true
    }
  ]
}
```

### POST `/api/meetings/:id/pause`
**Description:** Pause a running meeting  
**Authentication:** Host token required  
**Response:**
```json
{
  "status": "paused"
}
```

### POST `/api/meetings/:id/resume`
**Description:** Resume a paused meeting  
**Authentication:** Host token required  
**Response:**
```json
{
  "status": "running"
}
```

### POST `/api/meetings/:id/advance`
**Description:** Manually advance one AI turn  
**Authentication:** Host token required  
**Response:**
```json
{
  "concluded": false,
  "turnGenerated": true
}
```
OR (if meeting concludes):
```json
{
  "concluded": true,
  "report": { ... }
}
```

### POST `/api/meetings/:id/inject`
**Description:** Inject human message into conversation  
**Authentication:** None required  
**Body:**
```json
{
  "author": "participant-name-or-email",
  "message": "Human interjection message"
}
```
**Response:**
```json
{
  "ok": true
}
```

---

## 👥 Participant Endpoints

### GET `/api/participant?token=<token>`
**Description:** Get participant details using invitation token  
**Authentication:** None required (token in query param)  
**Response:**
```json
{
  "id": "participant-id",
  "meetingId": "meeting-id",
  "email": "participant@example.com",
  "hasSubmitted": true,
  "subject": "Meeting Subject",
  "details": "Meeting details"
}
```

### POST `/api/participant/submit`
**Description:** Submit participant input for meeting  
**Authentication:** None required (token in body)  
**Body:**
```json
{
  "token": "participant-token",
  "content": "Participant's input (min 10 chars)",
  "name": "Optional display name"
}
```
**Response:**
```json
{
  "ok": true,
  "inputId": "input-uuid"
}
```

---

## 📊 Report Endpoints

### GET `/api/meetings/:id/report`
**Description:** Get final meeting report (available after meeting completes)  
**Authentication:** None required  
**Response:**
```json
{
  "id": "report-id",
  "meetingId": "meeting-id",
  "summary": "Meeting summary text",
  "highlights": ["highlight1", "highlight2"],
  "decisions": ["decision1", "decision2"],
  "actionItems": ["action1", "action2"],
  "visualMap": "mermaid-diagram-code",
  "createdAt": "2025-11-07T..."
}
```

---

## 🔐 Authentication Flow

1. **Host Login:**
   ```bash
   POST /api/auth/login
   Body: { "password": "host-password" }
   → Returns: { "token": "jwt..." }
   ```

2. **Use Token:**
   ```bash
   Authorization: Bearer <token>
   ```

3. **Participant Access:**
   - Participants use invitation tokens (no JWT needed)
   - Tokens are in email URLs: `/p/<token>`

---

## 🌐 CORS Configuration

Your current CORS configuration includes:
```bash
CORS_ORIGIN=https://a2mp.vercel.app,http://localhost:3000,https://ninety-bags-thank.loca.lt
```

**For tunnel services, add these patterns:**
```bash
# ngrok
CORS_ORIGIN=https://a2mp.vercel.app,https://*.ngrok.io,http://localhost:3000

# localtunnel
CORS_ORIGIN=https://a2mp.vercel.app,https://*.loca.lt,http://localhost:3000

# cloudflare tunnel
CORS_ORIGIN=https://a2mp.vercel.app,https://*.trycloudflare.com,http://localhost:3000
```

---

## 📝 Environment Variables Required

### Backend (Local .env file):
```bash
CORS_ORIGIN=https://a2mp.vercel.app,http://localhost:3000,https://ninety-bags-thank.loca.lt
HOST_PASSWORD=12345
JWT_SECRET=1ab98d1f6a6ddd121bbbbc5c21cff1373c2352c8921e921feacbf8c202b2a2b89adce37a46e4db79d2d26fbf920eefe9f9fa02874b5f61d6edf74db49839f509
GEMINI_API_KEY=AIzaSyCEtCXnOrSimCd-5flHnydDUxtJ-N3A6KE
GEMINI_MODERATOR_API_KEY=AIzaSyBJ8yo-txzQWfxBBdueX-BOqm9aReXGnwY
GEMINI_MODEL=gemini-2.5-flash
PORT=4000
DEV_MODE=true
ENGINE_TICK_MS=15000
MAX_TURNS_PER_MEETING=25
```

### Frontend (Vercel Environment Variables):
```bash
VITE_API_BASE_URL=https://ninety-bags-thank.loca.lt
# Or your current tunnel URL (ngrok/localtunnel/cloudflare)
```

---

## 🚀 Quick Test Commands

### Local Testing:
```bash
# Health check (local)
curl http://localhost:4000/api/health

# Health check (tunnel)
curl https://ninety-bags-thank.loca.lt/api/health

# Host login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"12345"}'

# Or via tunnel:
curl -X POST https://ninety-bags-thank.loca.lt/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"12345"}'
```

### PowerShell Testing:
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method Get

# Host login
$body = @{ password = "12345" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body $body -ContentType "application/json"

# Create meeting (replace <token> with actual JWT)
$meetingBody = @{
  subject = "Test Meeting"
  details = "Test meeting details"
  participants = @("test@example.com")
  participantBaseUrl = "https://a2mp.vercel.app/p"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/meetings" -Method Post -Body $meetingBody -ContentType "application/json" -Headers @{Authorization = "Bearer <token>"}
```