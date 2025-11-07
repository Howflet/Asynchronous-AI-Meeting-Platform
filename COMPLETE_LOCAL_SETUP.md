# Complete Local Development Setup - A2MP + Next.js

This guide covers running the complete A2MP (Asynchronous AI Meeting Platform) stack locally with both the backend and the new Next.js frontend.

## Architecture Overview

- **Backend**: Node.js/TypeScript Express server (Port 4000)
- **Frontend**: Next.js 16 with App Router (Port 3000)
- **Database**: SQLite (local file-based)
- **API**: RESTful with JWT authentication

## Quick Start (Automated)

Run both servers with one command:
```bash
start-complete-local-stack.bat
```

This will open two terminal windows:
- Backend on `http://localhost:4000`
- Next.js Frontend on `http://localhost:3000`

## Manual Setup

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will be available at `http://localhost:4000`

### 2. Start Next.js Frontend

```bash
cd nextjs-frontend
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Environment Configuration

### Backend (.env)
```env
# API Configuration
PORT=4000
CORS_ORIGIN=http://localhost:3000,https://*.vercel.app,https://ninety-bags-thank.loca.lt

# Authentication
HOST_PASSWORD=admin_12345

# Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_key_here
```

### Next.js Frontend (.env.local)
```env
# API Connection
NEXT_PUBLIC_VITE_API_BASE_URL=http://localhost:4000

# Authentication
NEXT_PUBLIC_HOST_PASSWORD=admin_12345
```

## Available Pages

The Next.js frontend includes these pages that connect to the backend:

### Public Pages
- `/` - Home page with features and getting started
- `/create` - Create new meeting (host authentication)
- `/meetings` - List all meetings (host authentication)
- `/meetings/[id]` - View meeting details and live conversation
- `/meetings/[id]/report` - Meeting summary report
- `/m/[id]` - Alternative meeting view URL
- `/r/[id]` - Alternative report view URL

### Participant Pages
- `/p` - Participant landing page
- `/participate/[token]` - Participant input page (token-based)

### Host Pages
- `/host` - Host dashboard
- `/meetings/[id]` - Meeting management

## API Integration

The frontend automatically handles:

### Authentication
- Auto-login with host password for protected endpoints
- JWT token management with automatic refresh
- Bearer token authentication for host actions

### Public Endpoints
- Meeting status and conversation viewing
- Participant input submission (token-based)
- Meeting reports and whiteboards

### Protected Endpoints (Host Only)
- Meeting creation and management
- Meeting start/pause/resume/advance
- System status monitoring

## Development Workflow

### 1. Create a Meeting
1. Open `http://localhost:3000`
2. Click "Create New Meeting"
3. Fill in meeting details and participant emails
4. Backend creates meeting and sends invitation emails

### 2. Participant Flow
1. Participants receive email with unique token link
2. Visit `/participate/[token]` to submit input
3. Backend stores input and generates AI persona

### 3. Host Management
1. Visit `/meetings` to see all meetings
2. Click on meeting to view live conversation
3. Use start/pause/resume controls as needed

### 4. View Results
1. Meeting report automatically available at `/meetings/[id]/report`
2. Real-time whiteboard shows key facts, decisions, actions
3. Full conversation transcript available

## Testing the Setup

### Backend Health Check
```bash
curl http://localhost:4000/health
```
Should return: `{"status":"OK"}`

### Frontend Connection Test
1. Open `http://localhost:3000`
2. Should see A2MP landing page
3. Try creating a test meeting
4. Check backend logs for API calls

### Database Check
Backend creates SQLite database at `backend/data/meetings.db` on first run.

## Common Issues

### Port Conflicts
If ports 3000 or 4000 are in use:
```bash
# Stop all Node processes
taskkill /f /im node.exe

# Or change ports in package.json scripts
```

### CORS Issues
Ensure `CORS_ORIGIN` in backend `.env` includes `http://localhost:3000`

### Authentication Issues
Verify `HOST_PASSWORD` matches in both backend `.env` and frontend `.env.local`

## Production Considerations

For production deployment:
1. Update `NEXT_PUBLIC_VITE_API_BASE_URL` to production backend URL
2. Use proper SSL certificates
3. Set secure environment variables
4. Consider database migration to PostgreSQL/MySQL

## File Structure

```
project/
├── backend/                 # Node.js/TypeScript backend
│   ├── src/
│   ├── package.json
│   └── .env
├── nextjs-frontend/         # Next.js 16 frontend
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable components
│   ├── lib/                 # API client and utilities
│   ├── package.json
│   └── .env.local
├── start-complete-local-stack.bat  # Quick start script
└── README.md
```

The setup is now complete and ready for development! 🚀