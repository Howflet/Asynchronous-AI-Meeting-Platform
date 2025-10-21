# A²MP — Asynchronous AI Meeting Platform## A²MP — AI‑Augmented Meeting Personas (Monorepo)



> Transform asynchronous collaboration with AI-powered meeting personas that discuss, debate, and reach consensus on your behalf.A²MP helps you run structured meetings where participants submit initial inputs, AI personas discuss in rounds, and a clear report is produced at the end. This repository contains two parallel implementations you can run:



## Overview- backend + frontend (recommended for local dev)

- server + web (alternative stack with a single API and separate UI)

A²MP (Asynchronous AI Meeting Platform) enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, then AI agents discuss the topic in real-time, collaborate, ask questions, and work toward consensus—completely autonomously.

### Repository layout

**Perfect for:**- `backend/`: Express API + Socket.IO realtime + conversation engine, SQLite persistence

- 🗳️ Distributed decision-making across time zones- `frontend/`: Vite + React UI that proxies to `backend`

- 💼 Budget planning with multiple stakeholders- `server/`: Alternative Express API (consolidated variant), SQLite persistence

- 🎯 Strategic planning sessions- `web/`: Vite + React UI targeting `server`

- 🤝 Conflict resolution and compromise building- `LICENSE`: Proprietary, evaluation‑only license

- 📊 Asynchronous brainstorming and ideation

### Requirements

**Key Features:**- Node.js 18+ (Node 20+ recommended)

- ✅ AI personas generated from participant inputs

- ✅ Natural conversational flow with turn-taking---

- ✅ Automatic pause when human input needed

- ✅ Real-time conversation streaming## Option A: Run backend + frontend (recommended)

- ✅ Collaborative whiteboard trackingThis pair is wired together via Vite dev proxy and root scripts.

- ✅ Automatic report generation

- ✅ Smart repetition detection### Install

- ✅ Dual API key support for quota isolationFrom the repo root:

```bash

---# root dev tooling (concurrently, prettier)

npm install

## Quick Start# app dependencies

npm install --prefix backend

### Prerequisitesnpm install --prefix frontend

- **Node.js 20+** (required)```

- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

- Optional: SMTP credentials for email invitations### Configure environment (optional but recommended)

Create `backend/.env` with any overrides:

### 1. Clone & Install```bash

```bash# Backend API

git clone <your-repo-url>PORT=4000

cd Asynchronous-AI-Meeting-PlatformCORS_ORIGIN=http://localhost:5173

npm install

npm install --prefix backend# Host auth

npm install --prefix frontendHOST_PASSWORD=change-me

```JWT_SECRET=dev-secret-change-me



### 2. Configure Environment# LLM (Google Gemini)

```bashGEMINI_API_KEY=your-gemini-api-key

# Copy the example fileGEMINI_MODEL=gemini-1.5-pro

cp backend/.env.example backend/.env

# Email (SMTP); if omitted, dev uses a JSON/log transport

# Edit backend/.env with your API keysSMTP_HOST=

# At minimum, set:SMTP_PORT=587

# - GEMINI_API_KEYSMTP_USER=

# - GEMINI_MODERATOR_API_KEY (or use same as above)SMTP_PASS=

```MAIL_FROM=a2mp@example.com



### 3. Run Development Server# Engine

```bashENGINE_TICK_MS=8000

npm run dev```

```Notes:

- Email settings are optional in development. Without SMTP, invites are logged.

This starts:- Default `HOST_PASSWORD` is `password` if not set; change it for anything public.

- 🔧 Backend API on `http://localhost:4000`

- 🎨 Frontend UI on `http://localhost:5174`### Develop

From the repo root:

### 4. Create Your First Meeting```bash

1. Open `http://localhost:5174`npm run dev

2. Log in as host (default password: `password`)```

3. Create a meeting with 2 participantsThis runs:

4. Share participant links- Backend on `http://localhost:4000`

5. Submit inputs as participants- Frontend on `http://localhost:5173`

6. Watch the AI conversation unfold!

Open the frontend, use “Host Login” with your `HOST_PASSWORD`, create a meeting, and share participant links from the UI. The engine advances turns automatically and produces a report.

---

### Build and run (production‑like)

## How It Works```bash

# build API and UI bundles

### 1. Persona Generationnpm run build

When a participant submits input, the system:# start only the backend API (serve your frontend separately)

- Analyzes their perspective and prioritiesnpm run start

- Generates a unique AI persona with identity, objectives, and communication style```

- Creates Model Context Protocol (MCP) instructions for the persona

### Data storage

### 2. Conversation Engine- SQLite database file for this implementation is created under `backend/backend/data/a2mp.db`.

The engine runs on a timer (default: every 15 seconds):

- Checks for meetings in "running" status---

- Calls moderator to decide next speaker

- Generates AI response from selected persona## Option B: Run server + web (alternative)

- Detects repetition patterns and pauses if stuckUse this pair if you prefer the consolidated API in `server/` and a separate `web/` UI.

- Checks for natural conclusion points

### Install

### 3. Smart Turn-Taking```bash

Moderator uses priority logic:npm install --prefix server

1. **Direct Questions**: If AI asks another AI a question, let them respondnpm install --prefix web

2. **First-Time Speakers**: Give everyone a chance before repeating```

3. **Alternation**: Prefer switching speakers (A→B→A→B)

4. **Free Choice**: Any speaker if no constraints### Configure environment

Create `server/.env`:

### 4. Collaboration```bash

AI personas are instructed to:PORT=8080

- Build on others' ideasWEB_ORIGIN=http://localhost:5173

- Find common ground and compromiseBASE_URL=http://localhost:8080

- Make concessions when appropriate

- Propose integrated solutionsGEMINI_API_KEY=your-gemini-api-key

- Support valid points from others

SMTP_HOST=

---SMTP_PORT=587

SMTP_USER=

## ConfigurationSMTP_PASS=

MAIL_FROM=no-reply@a2mp.local

Create `backend/.env` with your settings. See `backend/.env.example` for a complete template.```

Create `web/.env` (optional; defaults shown):

### Required Settings```bash

```bashVITE_API_BASE=http://localhost:8080

# Google Gemini API Keys (REQUIRED)```

GEMINI_API_KEY=your-api-key-here

GEMINI_MODERATOR_API_KEY=your-moderator-api-key-here### Develop

```In two terminals:

```bash

### Server Configurationnpm run dev --prefix server

```bashnpm run dev --prefix web

PORT=4000```

CORS_ORIGIN=http://localhost:5174- API on `http://localhost:8080`

```- Web UI on `http://localhost:5173`



### Host Authentication### Data storage

```bash- SQLite database file for this implementation is created under `server/data/a2mp.sqlite`.

HOST_PASSWORD=your-secure-password

JWT_SECRET=your-jwt-secret-key---

```

## Common scripts

### AI Model SettingsFrom the repo root:

```bash- `npm run dev`: run `backend` and `frontend` together (concurrently)

GEMINI_MODEL=gemini-2.5-flash- `npm run start`: start only the `backend` API

ENGINE_TICK_MS=15000- `npm run build`: build `backend` and `frontend`

MAX_TURNS_PER_MEETING=10- `npm run format`: format repo with Prettier

```

Project packages also expose their own `dev`, `build`, and `start` scripts.

### Email (Optional)

```bash## Notes and tips

SMTP_HOST=smtp.gmail.com- Frontend (`frontend/`) uses a Vite dev proxy to `/api` → `http://localhost:4000` and `/socket.io` for realtime.

SMTP_PORT=587- The alternative `web/` UI targets the `server/` API and uses `VITE_API_BASE` to choose the backend origin.

SMTP_USER=your-email@gmail.com- For production, set strong values for `HOST_PASSWORD` and `JWT_SECRET`, and configure SMTP if you want email delivery.

SMTP_PASS=your-app-password

MAIL_FROM=noreply@yourdomain.com## License

```This software is proprietary and provided for demonstration/evaluation only. See `LICENSE` for details.


See full configuration details in the `.env.example` file.

---

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

---

## API Endpoints

### Meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/:id/status` - Get status with conversation
- `POST /api/meetings/:id/inject` - Inject human message
- `POST /api/meetings/:id/advance` - Advance one turn (host)

### Participants
- `GET /api/participant?token=xxx` - Get participant details
- `POST /api/participant/submit` - Submit input

### Authentication
- `POST /api/auth/host/login` - Host login

### Real-time
- `GET /api/meetings/:id/stream` - SSE for live updates

---

## Debugging Tools

```bash
# View conversation
node check-conversation.js [meetingId]

# View report
node check-report.js [meetingId]

# List meetings
node list-meetings.js

# View database
node check-db.js

# Check quota
node check-quota.js
```

---

## Troubleshooting

### Meeting Not Starting
- Ensure all participants submitted
- Check: `node list-meetings.js`
- Verify engine logs (every 15 seconds)

### API Key Issues
- Verify keys at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check quota: `node check-quota.js`
- Both keys must be set

### Personas Repeating
- Anti-repetition mechanisms included
- Try more diverse inputs
- Check conversation: `node check-conversation.js`

### No Report Generated
- Check: `node check-report.js [meetingId]`
- Verify meeting status is "completed"
- Review server logs

---

## Production Deployment

### Security
- Change `HOST_PASSWORD` to strong password
- Set unique `JWT_SECRET`
- Use HTTPS
- Configure CORS properly
- Rotate API keys regularly

### Build
```bash
npm run build
npm run start
```

### Database Backup
```bash
cp backend/backend/data/a2mp.db backups/a2mp-$(date +%Y%m%d).db
```

---

## Development

### Scripts
```bash
npm run dev          # Run backend + frontend
npm run build        # Build for production
npm run start        # Start production build
npm run format       # Format with Prettier
```

### Code Structure
- `backend/src/services/` - Business logic
- `backend/src/llm/` - Gemini integration
- `frontend/src/pages/` - UI components
- `check-*.js` - Debugging utilities

---

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, SQLite
- **Frontend**: React, TypeScript, Vite
- **AI**: Google Gemini 2.5 Flash
- **Real-time**: Server-Sent Events + polling

---

## Rate Limiting

Dual API key system for better quota management:
- **Participant Key**: Persona generation/responses (250 req/day)
- **Moderator Key**: Turn decisions/conclusions (250 req/day)
- **Total**: 500+ requests per day
- **Per Key**: 10 RPM, 250K TPM, 250 RPD

---

## License

Proprietary. Evaluation only. See `LICENSE` for details.

---

## Credits

Built with Google Gemini API, Express, React, Vite, TypeScript, and better-sqlite3.

---

**Made with ❤️ for asynchronous collaboration**
