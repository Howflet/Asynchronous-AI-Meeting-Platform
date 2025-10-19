# A²MP

AI-assisted meeting platform that collects participant inputs, generates AI personas, runs a moderated conversation loop, and produces a structured report (highlights, decisions, actions, and a Mermaid diagram).

This repository is a small monorepo with two implementation variants:
- backend + frontend (recommended dev path)
- server + web (alternate minimal pair)


## Repository structure

- `backend/` — Express + Socket.IO TypeScript API (port 4000), SQLite in `backend/data/a2mp.db`
- `frontend/` — React + Vite UI (port 5173), proxies `/api` and `/socket.io` to `:4000`
- `server/` — Alternate Express API (port 8080), SQLite in `server/data/a2mp.sqlite`
- `web/` — Alternate React + Vite UI (port 5173), uses `VITE_API_BASE` to point at the `server`
- `LICENSE` — Proprietary license


## Requirements

- Node.js 18+ (20+ recommended)
- npm


## Quick start (recommended: backend + frontend)

1) Install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

2) Configure environment for the backend (create `backend/.env`)

```bash
# Server
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Auth (development defaults exist, but change for real use)
HOST_PASSWORD=change-me
JWT_SECRET=change-me

# LLM (required for persona generation, moderation, and summaries)
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-1.5-pro

# Email (optional; used to send participant invites)
MAIL_FROM=a2mp@example.com
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Conversation engine tick (ms)
ENGINE_TICK_MS=8000
```

3) Run both apps in dev mode (from repo root)

```bash
# After installing deps above
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`

Notes
- Root `npm run dev` uses `concurrently` to run `backend` and `frontend` together; it assumes you installed each app’s deps first.
- You can also start them in two terminals with `npm run dev` inside each folder.


## Alternate minimal pair (server + web)

This is a self-contained variant with a leaner API and a UI that talks to it directly.

1) Install dependencies

```bash
npm install --prefix server
npm install --prefix web
```

2) Configure `server/.env` (optional — see defaults in code)

```bash
PORT=8080
WEB_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:8080

# Email invites
MAIL_FROM=no-reply@a2mp.local
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# LLM
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-1.5-pro
```

3) Run the API and UI (in two terminals)

```bash
npm run dev --prefix server
# In another terminal
npm run dev --prefix web
```

4) Point the web app at the API (optional)

`web` uses `VITE_API_BASE` (defaults to `http://localhost:8080`). For example:

```bash
# From web/
VITE_API_BASE=http://localhost:8080 npm run dev
```

Ports
- Web UI: `http://localhost:5173`
- API: `http://localhost:8080`


## Database locations

- backend: `backend/data/a2mp.db` (auto-created)
- server: `server/data/a2mp.sqlite` (auto-created)

To reset local data, stop the server(s) and delete these files/directories.


## Development scripts

From repo root:

```bash
# Run backend (4000) and frontend (5173) together
npm run dev

# Build backend and frontend
npm run build

# Start only the backend (production-style)
npm run start

# Format all files via Prettier
npm run format
```

Within each app (`backend/`, `frontend/`, `server/`, `web/`) there are standard `dev`, `build`, and (where applicable) `start` scripts.


## How it works (high level)

- Host creates a meeting and enters participant emails.
- Participants receive invite links and submit initial inputs.
- Backend generates AI personas (via Gemini) and runs a moderated turn loop, emitting events via SSE/Socket.
- A live view shows the conversation and status in real time.
- When the conversation concludes, the system creates a final report including a Mermaid-based visual map.

Key files (for reference)
- Backend API routes: `backend/src/routes.ts`
- Backend DB schema/init: `backend/src/db.ts`
- LLM integration: `backend/src/llm/gemini.ts`
- Frontend proxy config: `frontend/vite.config.ts`
- Alternate API entry: `server/src/index.ts`


## Production notes

- Defaults like `HOST_PASSWORD` and `JWT_SECRET` are for local development; set strong values in production.
- Restrict `CORS_ORIGIN` to your real frontend origin(s).
- Provide a valid `GEMINI_API_KEY`; LLM-powered features require it.
- SMTP settings are optional but required to actually send invite emails.
- Consider running behind a reverse proxy and adding persistence/backups for SQLite.


## License

This project is distributed under a proprietary license. See `LICENSE` for details.
