# A²MP — Asynchronous AI Meeting Platform  

Transform asynchronous collaboration with **AI-powered meeting personas** that discuss, debate, and reach consensus on your behalf.

---

## Overview

A²MP enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, and then AI agents autonomously discuss the topic, collaborate, ask questions, and work toward a consensus.

### Use Cases
- Distributed decision-making across time zones  
- Budget planning with multiple stakeholders  
- Strategic planning sessions  
- Conflict resolution and compromise building  
- Asynchronous brainstorming and ideation  

---

## Key Features
- AI personas generated from participant inputs  
- Natural conversational flow with turn-taking  
- Automatic pause when human input needed  
- Real-time conversation streaming  
- Smart repetition detection  
- Automatic report generation  
- Dual API key support for quota isolation  
- Collaborative whiteboard tracking  

---

## Repository Layout
```

backend/   – Express API + Socket.IO + conversation engine (SQLite persistence)
frontend/  – React + Vite UI (proxies to backend)
server/    – Alternative consolidated Express API
web/       – React + Vite UI for server API
check-*.js – Debugging utilities
LICENSE    – Proprietary, evaluation-only license

````

---

## Quick Start

### 1. Prerequisites
- **Node.js 20+**
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- *(Optional)* SMTP credentials for email invitations

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd Asynchronous-AI-Meeting-Platform

npm install
npm install --prefix backend
npm install --prefix frontend
````

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
GEMINI_API_KEY=your-api-key
GEMINI_MODERATOR_API_KEY=your-moderator-api-key
HOST_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-key
```

Optional email settings:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=noreply@yourdomain.com
```

### 4. Run Development Server

```bash
npm run dev
```

* Backend: [http://localhost:4000](http://localhost:4000)
* Frontend: [http://localhost:5174](http://localhost:5174)

### 5. Create Your First Meeting

1. Open [http://localhost:5174](http://localhost:5174)
2. Log in as host (default password: `password`)
3. Create a meeting and add participants
4. Share participant links
5. Each participant submits inputs
6. Watch AI personas discuss and reach consensus

---

## How It Works

### 1. Persona Generation

Each participant’s submission generates an AI persona with:

* Identity and communication style
* Objectives and priorities
* Model Context Protocol (MCP) instructions

### 2. Conversation Engine

Runs every 15 seconds:

* Moderator decides next speaker
* AI persona responds
* Detects repetition or completion
* Pauses when human input is needed

### 3. Smart Turn-Taking

1. **Direct Questions:** If an AI asks another a question, that AI responds next.
2. **First-Time Speakers:** Everyone speaks before any repetition.
3. **Alternation:** Prefers A → B → A → B patterns.
4. **Free Choice:** Random speaker if no constraints.

### 4. Collaboration Logic

AI personas are instructed to:

* Build on others’ ideas
* Find common ground and compromise
* Make concessions when appropriate
* Propose integrated solutions

---

## API Endpoints

### Meetings

| Method | Endpoint                    | Description                         |
| ------ | --------------------------- | ----------------------------------- |
| POST   | `/api/meetings`             | Create a new meeting                |
| GET    | `/api/meetings/:id/status`  | Get meeting and conversation status |
| POST   | `/api/meetings/:id/inject`  | Inject a human message              |
| POST   | `/api/meetings/:id/advance` | Advance one AI turn                 |

### Participants

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| GET    | `/api/participant?token=xxx` | Get participant details  |
| POST   | `/api/participant/submit`    | Submit participant input |

### Authentication

* `POST /api/auth/host/login` — Host login

### Real-Time

* `GET /api/meetings/:id/stream` — Live meeting stream (SSE)

---

## Debugging Tools

```bash
node check-conversation.js [meetingId]  # View conversation
node check-report.js [meetingId]        # View report
node list-meetings.js                   # List meetings
node check-db.js                        # Inspect database
node check-quota.js                     # Check API quota
```

---

## Troubleshooting

### Meeting Not Starting

* Ensure all participants submitted
* Run:

  ```bash
  node list-meetings.js
  ```

### API Key Issues

* Validate keys at [Google AI Studio](https://makersuite.google.com/app/apikey)
* Both keys must be present in `.env`

### Personas Repeating

* Try more diverse participant inputs
* Check conversation:

  ```bash
  node check-conversation.js
  ```

### No Report Generated

* Run:

  ```bash
  node check-report.js [meetingId]
  ```
* Ensure meeting status is `completed`

---

## Production Deployment

### Security Checklist

* Change `HOST_PASSWORD` and `JWT_SECRET`
* Use HTTPS
* Restrict `CORS_ORIGIN` to your domain
* Rotate API keys periodically

### Build & Deploy

```bash
npm run build
npm run start
```

### Database Backup

```bash
cp backend/backend/data/a2mp.db backups/a2mp-$(date +%Y%m%d).db
```

---

## 🛠️ Development Scripts

```bash
npm run dev     # Run backend + frontend (dev)
npm run build   # Build for production
npm run start   # Start production server
npm run format  # Format with Prettier
```

---

## Tech Stack

* **Backend:** Node.js, Express, TypeScript, SQLite
* **Frontend:** React, TypeScript, Vite
* **AI:** Google Gemini 2.5 Flash
* **Realtime:** Server-Sent Events (SSE) + Socket.IO

---

## License

Proprietary software — evaluation only.
See [`LICENSE`](./LICENSE) for details.

