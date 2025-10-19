## A²MP — AI‑Augmented Meeting Personas (Monorepo)

A²MP helps you run structured meetings where participants submit initial inputs, AI personas discuss in rounds, and a clear report is produced at the end. This repository contains two parallel implementations you can run:

- backend + frontend (recommended for local dev)
- server + web (alternative stack with a single API and separate UI)

### Repository layout
- `backend/`: Express API + Socket.IO realtime + conversation engine, SQLite persistence
- `frontend/`: Vite + React UI that proxies to `backend`
- `server/`: Alternative Express API (consolidated variant), SQLite persistence
- `web/`: Vite + React UI targeting `server`
- `LICENSE`: Proprietary, evaluation‑only license

### Requirements
- Node.js 18+ (Node 20+ recommended)

---

## Option A: Run backend + frontend (recommended)
This pair is wired together via Vite dev proxy and root scripts.

### Install
From the repo root:
```bash
# root dev tooling (concurrently, prettier)
npm install
# app dependencies
npm install --prefix backend
npm install --prefix frontend
```

### Configure environment (optional but recommended)
Create `backend/.env` with any overrides:
```bash
# Backend API
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Host auth
HOST_PASSWORD=change-me
JWT_SECRET=dev-secret-change-me

# LLM (Google Gemini)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-pro

# Email (SMTP); if omitted, dev uses a JSON/log transport
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=a2mp@example.com

# Engine
ENGINE_TICK_MS=8000
```
Notes:
- Email settings are optional in development. Without SMTP, invites are logged.
- Default `HOST_PASSWORD` is `password` if not set; change it for anything public.

### Develop
From the repo root:
```bash
npm run dev
```
This runs:
- Backend on `http://localhost:4000`
- Frontend on `http://localhost:5173`

Open the frontend, use “Host Login” with your `HOST_PASSWORD`, create a meeting, and share participant links from the UI. The engine advances turns automatically and produces a report.

### Build and run (production‑like)
```bash
# build API and UI bundles
npm run build
# start only the backend API (serve your frontend separately)
npm run start
```

### Data storage
- SQLite database file for this implementation is created under `backend/backend/data/a2mp.db`.

---

## Option B: Run server + web (alternative)
Use this pair if you prefer the consolidated API in `server/` and a separate `web/` UI.

### Install
```bash
npm install --prefix server
npm install --prefix web
```

### Configure environment
Create `server/.env`:
```bash
PORT=8080
WEB_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:8080

GEMINI_API_KEY=your-gemini-api-key

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=no-reply@a2mp.local
```
Create `web/.env` (optional; defaults shown):
```bash
VITE_API_BASE=http://localhost:8080
```

### Develop
In two terminals:
```bash
npm run dev --prefix server
npm run dev --prefix web
```
- API on `http://localhost:8080`
- Web UI on `http://localhost:5173`

### Data storage
- SQLite database file for this implementation is created under `server/data/a2mp.sqlite`.

---

## Common scripts
From the repo root:
- `npm run dev`: run `backend` and `frontend` together (concurrently)
- `npm run start`: start only the `backend` API
- `npm run build`: build `backend` and `frontend`
- `npm run format`: format repo with Prettier

Project packages also expose their own `dev`, `build`, and `start` scripts.

## Notes and tips
- Frontend (`frontend/`) uses a Vite dev proxy to `/api` → `http://localhost:4000` and `/socket.io` for realtime.
- The alternative `web/` UI targets the `server/` API and uses `VITE_API_BASE` to choose the backend origin.
- For production, set strong values for `HOST_PASSWORD` and `JWT_SECRET`, and configure SMTP if you want email delivery.

## License
This software is proprietary and provided for demonstration/evaluation only. See `LICENSE` for details.
