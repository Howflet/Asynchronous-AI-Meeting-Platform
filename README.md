# A²MP — Asynchronous AI Meeting Platform

Transform asynchronous collaboration with **AI-powered meeting personas** that discuss, debate, and reach consensus on your behalf.

## Overview

A²MP enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, then AI agents discuss the topic in **real-time**, collaborate, ask questions, and work toward consensus completely autonomously.

**Perfect for:**

- 🗳️ Distributed decision-making across time zones
- 💼 Budget planning with multiple stakeholders
- 🎯 Strategic planning sessions
- 🤝 Conflict resolution and compromise building
- 📊 Asynchronous brainstorming and ideation

## ✨ Key Features

- ✅ **AI personas** generated from participant inputs
- ✅ **Real-time conversation streaming** via Socket.IO WebSockets
- ✅ **Smart turn-taking** with natural conversational flow
- ✅ **Automatic pause** when human input needed
- ✅ **Live participation** - inject messages during conversations
- ✅ **Collaborative whiteboard** tracking shared ideas
- ✅ **Visual message distinction** - color-coded AI vs human messages
- ✅ **Smart repetition detection** to prevent loops
- ✅ **Automatic report generation** with consensus summaries and transcripts
- ✅ **Dual API key support** for quota isolation

## Repository Structure

```
backend/           – Express API + Socket.IO + conversation engine (SQLite)
nextjs-frontend/   – Next.js 14 UI with real-time features
scripts/           – Additional debugging and admin utilities
check-*.js         – Core debugging tools (conversation, reports, quota)
LICENSE            – Proprietary, evaluation-only license
```

## Quick Start

### Prerequisites

- **Node.js 20+** (required)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- Optional: SMTP credentials for email invitations

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Asynchronous-AI-Meeting-Platform

# Install dependencies
npm install
npm install --prefix backend  
npm install --prefix nextjs-frontend
```

### 2. Configure Environment

```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your API keys:

```env
GEMINI_API_KEY=your-api-key-here
GEMINI_MODERATOR_API_KEY=your-moderator-api-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

This starts:

- 🔧 Backend API on http://localhost:4000
- 🎨 Next.js Frontend on http://localhost:3000

### 4. Create Your First Meeting

1. Open http://localhost:3000
2. Log in as host (default password: `password`)
3. Create a meeting with 2+ participants
4. Share participant links
5. Submit inputs as each participant
6. Watch the AI conversation unfold in real-time!

## How It Works

### 1. Persona Generation

Each participant's input is analyzed to create a unique AI persona with:

- Identity and role description
- Objectives and priorities
- Communication style
- Model Context Protocol (MCP) instructions

### 2. Real-Time Conversation Engine

The engine runs continuously and:

- Monitors meetings in "running" status
- Uses AI moderator to decide next speaker
- Generates responses from selected personas
- Detects repetition patterns and pauses if stuck
- Broadcasts updates via Socket.IO WebSockets
- Checks for natural conclusion points

### 3. Smart Turn-Taking

Moderator uses priority logic:

1. **Direct Questions**: If AI asks another AI a question, let them respond
2. **First-Time Speakers**: Give everyone a chance before repeating
3. **Alternation**: Prefer switching speakers (A→B→A→B)
4. **Free Choice**: Any speaker if no constraints

### 4. Collaboration Features

AI personas are instructed to:

- Build on others' ideas
- Find common ground and compromise
- Make concessions when appropriate
- Propose integrated solutions
- Support valid points from others
- Avoid repetition and circular arguments

## Configuration

Create `backend/.env` with your settings. See `backend/.env.example` for a complete template.

### Required Settings

```bash
# Google Gemini API Keys (REQUIRED)
GEMINI_API_KEY=your-api-key-here
GEMINI_MODERATOR_API_KEY=your-moderator-api-key-here
```

### Server Configuration

```bash
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

### Host Authentication

```bash
HOST_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-key
```

### AI Model Settings

```bash
GEMINI_MODEL=gemini-2.5-flash
ENGINE_TICK_MS=15000
MAX_TURNS_PER_MEETING=10
```

### Email (Optional)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=noreply@yourdomain.com
```

## Usage Guide

### Creating a Meeting

1. Log in as host
2. Enter meeting subject and context
3. Add participant emails
4. Click "Create Meeting & Invite"
5. Participants submit via unique links
6. Meeting starts automatically

### Watching Live

- **Host View**: See all turns, whiteboard, inject messages
- **Participant View**: Watch conversation after submission, inject when paused

### Human Interjection

- Meetings pause when conversation gets stuck
- Host or participants can inject guidance
- Meeting resumes automatically after input
- Messages are visually distinguished (green for human, blue for AI)

## API Endpoints

### Meetings

- `POST /api/meetings` - Create meeting
- `GET /api/meetings/:id/status` - Get status with conversation
- `POST /api/meetings/:id/inject` - Inject human message
- `POST /api/meetings/:id/advance` - Advance one turn (host)
- `GET /api/meetings/:id/report` - Get complete report with transcript

### Participants

- `GET /api/participant?token=xxx` - Get participant details
- `POST /api/participant/submit` - Submit input

### Authentication

- `POST /api/auth/host/login` - Host login

### Real-time

- **Socket.IO Events**: `turn`, `status`, `whiteboard` for live updates
- **WebSocket Connection**: Automatic room joining and broadcasting

## Debugging Tools

### Core Debugging Scripts

```bash
node check-conversation.js [meetingId]   # View meeting conversations
node check-report.js [meetingId]         # View meeting reports
node list-meetings.js                    # List all meetings
node check-db.js                         # Database inspection
node check-quota.js                      # API quota monitoring
```

### Additional Utilities (scripts/ folder)

```bash
node scripts/view-inputs.js [meetingId]         # View participant inputs
node scripts/view-personas.js [meetingId]       # View generated personas
node scripts/check-last-meeting.js              # Check latest meeting details
node scripts/find-complete-meetings.js          # Find most active meetings
node scripts/check-meeting-timeline.js          # Meeting progress timeline
```

## Troubleshooting

### Meeting Not Starting

Check that all participants have submitted:

```bash
node list-meetings.js
```

Verify engine logs run every 15 seconds in the terminal.

### API Key Issues

Verify your keys at [Google AI Studio](https://makersuite.google.com/app/apikey)

Check quota:

```bash
node check-quota.js
```

Both keys must be set in your `.env` file.

### Personas Repeating

Anti-repetition mechanisms are included. If personas still repeat, try:

- More diverse participant inputs
- Check conversation history:

  ```bash
  node check-conversation.js
  ```

### Real-time Updates Not Working

- Ensure Socket.IO connection is established (check browser console)
- Verify WebSocket connections aren't blocked by firewall
- Check that backend Socket.IO server is running on port 4000

### Report Missing Transcript

The report API now includes the full conversation transcript. If transcript is missing:

- Ensure the meeting is completed
- Check backend logs for report generation errors
- Verify conversation data exists using `node check-conversation.js [meetingId]`

### No Report Generated

Check the report:

```bash
node check-report.js [meetingId]
```

Verify meeting status is "completed" and review server logs for errors.

## Production Deployment

### Security Checklist

- Change `HOST_PASSWORD` to a strong password
- Set a unique `JWT_SECRET` (32+ random characters)
- Use HTTPS for all connections
- Configure CORS properly for your domain
- Rotate API keys regularly

### Build and Deploy

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

### Database Backup

Create daily backups:

```bash
cp backend/backend/data/a2mp.db backups/a2mp-backup-$(date +%Y%m%d).db
```

## Development

### Available Scripts

Run both backend and frontend:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start production build:

```bash
npm run start
```

Format code with Prettier:

```bash
npm run format
```

### Code Structure

- `backend/src/services/` - Business logic
- `backend/src/llm/` - Gemini integration
- `backend/src/realtime.ts` - Socket.IO real-time system
- `nextjs-frontend/app/` - Next.js 14 app router pages
- `nextjs-frontend/components/` - Reusable UI components
- `scripts/` - Additional debugging and admin utilities

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, SQLite
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Real-time**: Socket.IO WebSockets
- **AI**: Google Gemini 2.5 Flash
- **Database**: SQLite with better-sqlite3

## Rate Limiting

Dual API key system for better quota management:

- **Participant Key**: Persona generation/responses (250 req/day)
- **Moderator Key**: Turn decisions/conclusions (250 req/day)
- **Total**: 500+ requests per day
- **Per Key**: 10 RPM, 250K TPM, 250 RPD

## License

Proprietary. Evaluation only. See `LICENSE` for details.

## Credits

Built with Google Gemini API, Express, React, Next.js, Socket.IO, Vite, TypeScript, and better-sqlite3.

---

**Made with ❤️ for asynchronous collaboration**
