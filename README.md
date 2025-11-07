# A²MP — Asynchronous AI Meeting Platform# A²MP — Asynchronous AI Meeting Platform<<<<<<< HEAD



Transform asynchronous collaboration with **AI-powered meeting personas** that discuss, debate, and reach consensus on your behalf.# A²MP — Asynchronous AI Meeting Platform# A²MP — Asynchronous AI Meeting Platform# A²MP - Asynchronous AI Meeting Platform# A²MP - Asynchronous AI Meeting Platform# A²MP — Asynchronous AI Meeting Platform## A²MP — AI‑Augmented Meeting Personas (Monorepo)



## OverviewTransform asynchronous collaboration with **AI-powered meeting personas** that discuss, debate, and reach consensus on your behalf.=======



A²MP enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, then AI agents discuss the topic in **real-time**, collaborate, ask questions, and work toward consensus completely autonomously.# A²MP — Asynchronous AI Meeting Platform  



**Perfect for:**## Overview>>>>>>> 79e53290a585ba334eb8e4ff5fabb98058e43c69

- 🗳️ Distributed decision-making across time zones  

- 💼 Budget planning with multiple stakeholders

- 🎯 Strategic planning sessions

- 🤝 Conflict resolution and compromise buildingA²MP enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, then AI agents discuss the topic in **real-time**, collaborate, ask questions, and work toward consensus completely autonomously.Transform asynchronous collaboration with **AI-powered meeting personas** that discuss, debate, and reach consensus on your behalf.

- 📊 Asynchronous brainstorming and ideation



## ✨ Key Features

**Perfect for:**---

- ✅ **AI personas** generated from participant inputs

- ✅ **Real-time conversation streaming** via Socket.IO WebSockets- 🗳️ Distributed decision-making across time zones  

- ✅ **Smart turn-taking** with natural conversational flow

- ✅ **Automatic pause** when human input needed- 💼 Budget planning with multiple stakeholders## Overview

- ✅ **Live participation** - inject messages during conversations

- ✅ **Collaborative whiteboard** tracking shared ideas- 🎯 Strategic planning sessions

- ✅ **Visual message distinction** - color-coded AI vs human messages

- ✅ **Smart repetition detection** to prevent loops- 🤝 Conflict resolution and compromise buildingA²MP enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, and then AI agents autonomously discuss the topic, collaborate, ask questions, and work toward a consensus.

- ✅ **Automatic report generation** with consensus summaries and transcripts

- ✅ **Dual API key support** for quota isolation- 📊 Asynchronous brainstorming and ideation



## Repository Structure### Use Cases



```## ✨ Key Features- Distributed decision-making across time zones  

backend/           – Express API + Socket.IO + conversation engine (SQLite)

nextjs-frontend/   – Next.js 14 UI with real-time features- Budget planning with multiple stakeholders  

scripts/           – Additional debugging and admin utilities

check-*.js         – Core debugging tools (conversation, reports, quota)- ✅ **AI personas** generated from participant inputs- Strategic planning sessions  

LICENSE           – Proprietary, evaluation-only license

```- ✅ **Real-time conversation streaming** via Socket.IO WebSockets- Conflict resolution and compromise building  



## Quick Start- ✅ **Smart turn-taking** with natural conversational flow- Asynchronous brainstorming and ideation  



### Prerequisites- ✅ **Automatic pause** when human input needed

- **Node.js 20+** (required)

- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))- ✅ **Live participation** - inject messages during conversations<<<<<<< HEAD

- Optional: SMTP credentials for email invitations

- ✅ **Collaborative whiteboard** tracking shared ideas## OverviewTransform asynchronous collaboration with AI-powered meeting personas that discuss, debate, and reach consensus on your behalf.

### 1. Clone & Install

- ✅ **Visual message distinction** - color-coded AI vs human messages=======

```bash

git clone <your-repo-url>- ✅ **Smart repetition detection** to prevent loops---

cd Asynchronous-AI-Meeting-Platform

- ✅ **Automatic report generation** with consensus summaries and transcripts>>>>>>> 79e53290a585ba334eb8e4ff5fabb98058e43c69

# Install dependencies

npm install- ✅ **Dual API key support** for quota isolation

npm install --prefix backend  

npm install --prefix nextjs-frontend## Key Features

```

## Repository Structure- AI personas generated from participant inputs  

### 2. Configure Environment

- Natural conversational flow with turn-taking  

```bash

# Copy the example file```- Automatic pause when human input needed  

cp backend/.env.example backend/.env

```backend/           – Express API + Socket.IO + conversation engine (SQLite)- Real-time conversation streaming  



Edit `backend/.env` with your API keys:nextjs-frontend/   – Next.js 14 UI with real-time features- Smart repetition detection  

```env

GEMINI_API_KEY=your-api-key-herecheck-*.js         – Debugging utilities- Automatic report generation  

GEMINI_MODERATOR_API_KEY=your-moderator-api-key-here

```LICENSE           – Proprietary, evaluation-only license- Dual API key support for quota isolation  



### 3. Run Development Server```- Collaborative whiteboard tracking  



```bash

npm run dev

```## Quick Start---



This starts:

- 🔧 Backend API on http://localhost:4000

- 🎨 Next.js Frontend on http://localhost:3000### Prerequisites<<<<<<< HEAD



### 4. Create Your First Meeting- **Node.js 20+** (required)A²MP (Asynchronous AI Meeting Platform) enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, then AI agents discuss the topic in **real-time**, collaborate, ask questions, and work toward consensus completely autonomously.



1. Open http://localhost:3000- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))=======

2. Log in as host (default password: `password`)

3. Create a meeting with 2+ participants  - Optional: SMTP credentials for email invitations## Repository Layout

4. Share participant links

5. Submit inputs as each participant```

6. Watch the AI conversation unfold in real-time!

### 1. Clone & Install>>>>>>> 79e53290a585ba334eb8e4ff5fabb98058e43c69

## How It Works



### 1. Persona Generation

Each participant's input is analyzed to create a unique AI persona with:```bashbackend/   – Express API + Socket.IO + conversation engine (SQLite persistence)

- Identity and role description

- Objectives and priorities  git clone <your-repo-url>frontend/  – React + Vite UI (proxies to backend)

- Communication style

- Model Context Protocol (MCP) instructionscd Asynchronous-AI-Meeting-Platformserver/    – Alternative consolidated Express API



### 2. Real-Time Conversation Engineweb/       – React + Vite UI for server API

The engine runs continuously and:

- Monitors meetings in "running" status# Install dependenciescheck-*.js – Debugging utilities

- Uses AI moderator to decide next speaker

- Generates responses from selected personasnpm installLICENSE    – Proprietary, evaluation-only license

- Detects repetition patterns and pauses if stuck

- Broadcasts updates via Socket.IO WebSocketsnpm install --prefix backend  

- Checks for natural conclusion points

npm install --prefix nextjs-frontend````

### 3. Smart Turn-Taking

Moderator uses priority logic:```

1. **Direct Questions**: If AI asks another AI a question, let them respond

2. **First-Time Speakers**: Give everyone a chance before repeating<<<<<<< HEAD

3. **Alternation**: Prefer switching speakers (A→B→A→B)

4. **Free Choice**: Any speaker if no constraints### 2. Configure Environment**Perfect for:**## OverviewTransform asynchronous collaboration with AI-powered meeting personas that discuss, debate, and reach consensus on your behalf.



### 4. Collaboration Features

AI personas are instructed to:

- Build on others' ideas```bash- 🗳️ Distributed decision-making across time zones  

- Find common ground and compromise  

- Make concessions when appropriate# Copy the example file

- Propose integrated solutions

- Support valid points from otherscp backend/.env.example backend/.env- 💼 Budget planning with multiple stakeholders

- Avoid repetition and circular arguments

```

## Configuration

- 🎯 Strategic planning sessions

Create `backend/.env` with your settings. See `backend/.env.example` for a complete template.

Edit `backend/.env` with your API keys:

### Required Settings

```env- 🤝 Conflict resolution and compromise buildingA²MP (Asynchronous AI Meeting Platform) enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, then AI agents discuss the topic in **real-time**, collaborate, ask questions, and work toward consensus completely autonomously.

```bash

# Google Gemini API Keys (REQUIRED)GEMINI_API_KEY=your-api-key-here

GEMINI_API_KEY=your-api-key-here

GEMINI_MODERATOR_API_KEY=your-moderator-api-key-hereGEMINI_MODERATOR_API_KEY=your-moderator-api-key-here- 📊 Asynchronous brainstorming and ideation

```

```

### Server Configuration



```bash

PORT=4000### 3. Run Development Server

CORS_ORIGIN=http://localhost:3000

```## ✨ Key Features



### Host Authentication```bash



```bashnpm run dev**Perfect for:**## Overview> Transform asynchronous collaboration with AI-powered meeting personas that discuss, debate, and reach consensus on your behalf.

HOST_PASSWORD=your-secure-password

JWT_SECRET=your-jwt-secret-key```

```

- ✅ **AI personas** generated from participant inputs

### AI Model Settings

This starts:

```bash

GEMINI_MODEL=gemini-2.5-flash- 🔧 Backend API on http://localhost:4000- ✅ **Real-time conversation streaming** via Socket.IO WebSockets- 🗳️ Distributed decision-making across time zones  

ENGINE_TICK_MS=15000

MAX_TURNS_PER_MEETING=10- 🎨 Next.js Frontend on http://localhost:3000

```

- ✅ **Smart turn-taking** with natural conversational flow

### Email (Optional)

### 4. Create Your First Meeting

```bash

SMTP_HOST=smtp.gmail.com- ✅ **Automatic pause** when human input needed- 💼 Budget planning with multiple stakeholders

SMTP_PORT=587

SMTP_USER=your-email@gmail.com1. Open http://localhost:3000

SMTP_PASS=your-app-password

MAIL_FROM=noreply@yourdomain.com2. Log in as host (default password: `password`)- ✅ **Live participation** - inject messages during conversations

```

3. Create a meeting with 2+ participants  

## Usage Guide

4. Share participant links- ✅ **Collaborative whiteboard** tracking shared ideas- 🎯 Strategic planning sessions

### Creating a Meeting

5. Submit inputs as each participant

1. Log in as host

2. Enter meeting subject and context6. Watch the AI conversation unfold in real-time!- ✅ **Visual message distinction** - color-coded AI vs human messages

3. Add participant emails

4. Click "Create Meeting & Invite"

5. Participants submit via unique links

6. Meeting starts automatically## How It Works- ✅ **Smart repetition detection** to prevent loops- 🤝 Conflict resolution and compromise buildingA²MP enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, then AI agents autonomously discuss the topic, collaborate, ask questions, and work toward consensus.



### Watching Live



- **Host View**: See all turns, whiteboard, inject messages### 1. Persona Generation- ✅ **Automatic report generation** with consensus summaries and transcripts

- **Participant View**: Watch conversation after submission, inject when paused

Each participant's input is analyzed to create a unique AI persona with:

### Human Interjection

- Identity and role description- ✅ **Dual API key support** for quota isolation- 📊 Asynchronous brainstorming and ideation

- Meetings pause when conversation gets stuck

- Host or participants can inject guidance- Objectives and priorities  

- Meeting resumes automatically after input

- Messages are visually distinguished (green for human, blue for AI)- Communication style



## API Endpoints- Model Context Protocol (MCP) instructions



### Meetings## Quick Start

- `POST /api/meetings` - Create meeting

- `GET /api/meetings/:id/status` - Get status with conversation  ### 2. Real-Time Conversation Engine

- `POST /api/meetings/:id/inject` - Inject human message

- `POST /api/meetings/:id/advance` - Advance one turn (host)The engine runs continuously and:

- `GET /api/meetings/:id/report` - Get complete report with transcript

- Monitors meetings in "running" status

### Participants

- `GET /api/participant?token=xxx` - Get participant details- Uses AI moderator to decide next speaker### Prerequisites## ✨ Key Features

- `POST /api/participant/submit` - Submit input

- Generates responses from selected personas

### Authentication

- `POST /api/auth/host/login` - Host login- Detects repetition patterns and pauses if stuck- **Node.js 20+** (required)



### Real-time- Broadcasts updates via Socket.IO WebSockets

- **Socket.IO Events**: `turn`, `status`, `whiteboard` for live updates

- **WebSocket Connection**: Automatic room joining and broadcasting- Checks for natural conclusion points- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))**Use Cases:**## Overview> Transform asynchronous collaboration with AI-powered meeting personas that discuss, debate, and reach consensus on your behalf.A²MP helps you run structured meetings where participants submit initial inputs, AI personas discuss in rounds, and a clear report is produced at the end. This repository contains two parallel implementations you can run:



## Debugging Tools



### Core Debugging Scripts### 3. Smart Turn-Taking- Optional: SMTP credentials for email invitations

```bash

node check-conversation.js [meetingId]   # View meeting conversationsModerator uses priority logic:

node check-report.js [meetingId]        # View meeting reports  

node list-meetings.js                   # List all meetings1. **Direct Questions**: If AI asks another AI a question, let them respond- ✅ **AI personas** generated from participant inputs

node check-db.js                        # Database inspection

node check-quota.js                     # API quota monitoring2. **First-Time Speakers**: Give everyone a chance before repeating

```

3. **Alternation**: Prefer switching speakers (A→B→A→B)### 1. Clone & Install

### Additional Utilities (scripts/ folder)

```bash4. **Free Choice**: Any speaker if no constraints

node scripts/view-inputs.js [meetingId]        # View participant inputs

node scripts/view-personas.js [meetingId]      # View generated personas  - ✅ **Real-time conversation streaming** via Socket.IO WebSockets- Distributed decision-making across time zones

node scripts/check-last-meeting.js            # Check latest meeting details

node scripts/find-complete-meetings.js        # Find most active meetings### 4. Collaboration Features

node scripts/check-meeting-timeline.js        # Meeting progress timeline

```AI personas are instructed to:```bash



## Troubleshooting- Build on others' ideas



### Meeting Not Starting- Find common ground and compromise  git clone <your-repo-url>- ✅ **Smart turn-taking** with natural conversational flow



Check that all participants have submitted:- Make concessions when appropriate

```bash

node list-meetings.js- Propose integrated solutionscd Asynchronous-AI-Meeting-Platform

```

- Support valid points from others

Verify engine logs run every 15 seconds in the terminal.

- Avoid repetition and circular arguments- ✅ **Automatic pause** when human input needed- Budget planning with multiple stakeholders

### API Key Issues



Verify your keys at [Google AI Studio](https://makersuite.google.com/app/apikey)

## Configuration# Install dependencies

Check quota:

```bash

node check-quota.js

```Create `backend/.env` with your settings. See `backend/.env.example` for a complete template.npm install- ✅ **Live participation** - inject messages during conversations



Both keys must be set in your `.env` file.



### Personas Repeating### Required Settingsnpm install --prefix backend



Anti-repetition mechanisms are included. If personas still repeat, try:

- More diverse participant inputs

- Check conversation history:```bashnpm install --prefix frontend- ✅ **Collaborative whiteboard** tracking shared ideas- Strategic planning sessions

  ```bash

  node check-conversation.js# Google Gemini API Keys (REQUIRED)

  ```

GEMINI_API_KEY=your-api-key-here```

### Real-time Updates Not Working

GEMINI_MODERATOR_API_KEY=your-moderator-api-key-here

- Ensure Socket.IO connection is established (check browser console)

- Verify WebSocket connections aren't blocked by firewall```- ✅ **Visual message distinction** - color-coded AI vs human messages

- Check that backend Socket.IO server is running on port 4000



### Report Missing Transcript

### Server Configuration### 2. Configure Environment

The report API now includes the full conversation transcript. If transcript is missing:

- Ensure the meeting is completed

- Check backend logs for report generation errors

- Verify conversation data exists using `node check-conversation.js [meetingId]````bash- ✅ **Smart repetition detection** to prevent loops- Conflict resolution and compromise buildingA²MP (Asynchronous AI Meeting Platform) enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, then AI agents discuss the topic in real-time, collaborate, ask questions, and work toward consensus completely autonomously.



### No Report GeneratedPORT=4000



Check the report:CORS_ORIGIN=http://localhost:3000```bash

```bash

node check-report.js [meetingId]```

```

# Copy the example file- ✅ **Automatic report generation** with consensus summaries

Verify meeting status is "completed" and review server logs for errors.

### Host Authentication

## Production Deployment

cp backend/.env.example backend/.env

### Security Checklist

```bash

- Change `HOST_PASSWORD` to a strong password

- Set a unique `JWT_SECRET` (32+ random characters)  HOST_PASSWORD=your-secure-password```- ✅ **Dual API key support** for quota isolation- Asynchronous brainstorming and ideation

- Use HTTPS for all connections

- Configure CORS properly for your domainJWT_SECRET=your-jwt-secret-key=======

- Rotate API keys regularly

```---

### Build and Deploy



Build the project:

```bash### AI Model Settings## Quick Start

npm run build

```



Start the production server:```bash### 1. Prerequisites

```bash

npm run startGEMINI_MODEL=gemini-2.5-flash- **Node.js 20+**

```

ENGINE_TICK_MS=15000- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Database Backup

MAX_TURNS_PER_MEETING=10- *(Optional)* SMTP credentials for email invitations

Create daily backups:

```bash```

cp backend/backend/data/a2mp.db backups/a2mp-backup-$(date +%Y%m%d).db

```### 2. Clone & Install



## Development### Email (Optional)```bash



### Available Scriptsgit clone <your-repo-url>



Run both backend and frontend:```bashcd Asynchronous-AI-Meeting-Platform

```bash

npm run devSMTP_HOST=smtp.gmail.com

```

SMTP_PORT=587npm install

Build for production:

```bashSMTP_USER=your-email@gmail.comnpm install --prefix backend

npm run build  

```SMTP_PASS=your-app-passwordnpm install --prefix frontend



Start production build:MAIL_FROM=noreply@yourdomain.com````

```bash

npm run start```

```

### 3. Configure Environment

Format code with Prettier:

```bash## Usage Guide

npm run format

``````bash



### Code Structure### Creating a Meetingcp backend/.env.example backend/.env



- `backend/src/services/` - Business logic```

- `backend/src/llm/` - Gemini integration

- `backend/src/realtime.ts` - Socket.IO real-time system1. Log in as host

- `nextjs-frontend/app/` - Next.js 14 app router pages

- `nextjs-frontend/components/` - Reusable UI components2. Enter meeting subject and contextEdit `backend/.env`:

- `scripts/` - Additional debugging and admin utilities

3. Add participant emails

## Tech Stack

4. Click "Create Meeting & Invite"```env

- **Backend**: Node.js, Express, TypeScript, SQLite

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS5. Participants submit via unique linksGEMINI_API_KEY=your-api-key

- **Real-time**: Socket.IO WebSockets

- **AI**: Google Gemini 2.5 Flash6. Meeting starts automaticallyGEMINI_MODERATOR_API_KEY=your-moderator-api-key

- **Database**: SQLite with better-sqlite3

HOST_PASSWORD=your-secure-password

## Rate Limiting

### Watching LiveJWT_SECRET=your-jwt-secret-key

Dual API key system for better quota management:

```

- **Participant Key**: Persona generation/responses (250 req/day)

- **Moderator Key**: Turn decisions/conclusions (250 req/day)  - **Host View**: See all turns, whiteboard, inject messages

- **Total**: 500+ requests per day

- **Per Key**: 10 RPM, 250K TPM, 250 RPD- **Participant View**: Watch conversation after submission, inject when pausedOptional email settings:



## License>>>>>>> 79e53290a585ba334eb8e4ff5fabb98058e43c69



Proprietary. Evaluation only. See `LICENSE` for details.### Human Interjection



## Credits```env



Built with Google Gemini API, Express, React, Next.js, Socket.IO, Vite, TypeScript, and better-sqlite3.- Meetings pause when conversation gets stuckSMTP_HOST=smtp.gmail.com



---- Host or participants can inject guidanceSMTP_PORT=587



**Made with ❤️ for asynchronous collaboration**- Meeting resumes automatically after inputSMTP_USER=your-email@gmail.com

- Messages are visually distinguished (green for human, blue for AI)SMTP_PASS=your-app-password

MAIL_FROM=noreply@yourdomain.com

## API Endpoints```



### Meetings### 4. Run Development Server

- `POST /api/meetings` - Create meeting

- `GET /api/meetings/:id/status` - Get status with conversation  <<<<<<< HEAD

- `POST /api/meetings/:id/inject` - Inject human messageEdit `backend/.env` with your API keys:

- `POST /api/meetings/:id/advance` - Advance one turn (host)

- `GET /api/meetings/:id/report` - Get complete report with transcript```env



### ParticipantsGEMINI_API_KEY=your-api-key-here## Quick Start

- `GET /api/participant?token=xxx` - Get participant details

- `POST /api/participant/submit` - Submit inputGEMINI_MODERATOR_API_KEY=your-moderator-api-key-here



### Authentication```

- `POST /api/auth/host/login` - Host login



### Real-time

- **Socket.IO Events**: `turn`, `status`, `whiteboard` for live updates### 3. Run Development Server### Prerequisites**Key Features:**

- **WebSocket Connection**: Automatic room joining and broadcasting



## Debugging Tools

```bash- **Node.js 20+** (required)

View conversation:

```bashnpm run dev

node check-conversation.js [meetingId]

``````- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))- AI personas generated from participant inputs**Perfect for:**## Overview- backend + frontend (recommended for local dev)



View report:

```bash

node check-report.js [meetingId]  This starts:- Optional: SMTP credentials for email invitations

```

- 🔧 Backend API on http://localhost:4000

List meetings:

```bash- 🎨 Frontend UI on http://localhost:5174- Natural conversational flow with turn-taking

node list-meetings.js

```



View database:### 4. Create Your First Meeting### 1. Clone & Install

```bash

node check-db.js

```

1. Open http://localhost:5174- Automatic pause when human input needed- 🗳️ Distributed decision-making across time zones

Check quota:

```bash2. Log in as host (default password: `password`)

node check-quota.js

```3. Create a meeting with 2+ participants  ```bash



## Troubleshooting4. Share participant links



### Meeting Not Starting5. Submit inputs as each participantgit clone <your-repo-url>- Real-time conversation streaming



Check that all participants have submitted:6. Watch the AI conversation unfold in real-time!

```bash

node list-meetings.jscd Asynchronous-AI-Meeting-Platform

```

## How It Works

Verify engine logs run every 15 seconds in the terminal.

- Collaborative whiteboard tracking- 💼 Budget planning with multiple stakeholders- server + web (alternative stack with a single API and separate UI)

### API Key Issues

### 1. Persona Generation

Verify your keys at [Google AI Studio](https://makersuite.google.com/app/apikey)

Each participant's input is analyzed to create a unique AI persona with:# Install dependencies

Check quota:

```bash- Identity and role description

node check-quota.js

```- Objectives and priorities  npm install- Smart repetition detection



Both keys must be set in your `.env` file.- Communication style



### Personas Repeating- Model Context Protocol (MCP) instructionsnpm install --prefix backend



Anti-repetition mechanisms are included. If personas still repeat, try:

- More diverse participant inputs

- Check conversation history:### 2. Real-Time Conversation Enginenpm install --prefix frontend- Dual API key support for quota isolation- 🎯 Strategic planning sessions

  ```bash

  node check-conversation.jsThe engine runs continuously and:

  ```

- Monitors meetings in "running" status```

### Real-time Updates Not Working

- Uses AI moderator to decide next speaker

- Ensure Socket.IO connection is established (check browser console)

- Verify WebSocket connections aren't blocked by firewall- Generates responses from selected personas

- Check that backend Socket.IO server is running on port 4000

- Detects repetition patterns and pauses if stuck

### Report Missing Transcript

- Broadcasts updates via Socket.IO WebSockets### 2. Configure Environment

The report API now includes the full conversation transcript. If transcript is missing:

- Ensure the meeting is completed- Checks for natural conclusion points

- Check backend logs for report generation errors

- Verify conversation data exists using `node check-conversation.js [meetingId]`---- 🤝 Conflict resolution and compromise building A²MP (Asynchronous AI Meeting Platform) enables structured virtual meetings where AI personas represent different stakeholders. Participants submit their inputs once, then AI agents discuss the topic in real-time, collaborate, ask questions, and work toward consensus completely autonomously.



### No Report Generated### 3. Smart Turn-Taking



Check the report:Moderator uses priority logic:```bash

```bash

node check-report.js [meetingId]1. **Direct Questions**: If AI asks another AI a question, let them respond

```

2. **First-Time Speakers**: Give everyone a chance before repeating# Copy the example file

Verify meeting status is "completed" and review server logs for errors.

3. **Alternation**: Prefer switching speakers (A→B→A→B)

## Production Deployment

4. **Free Choice**: Any speaker if no constraintscp backend/.env.example backend/.env

### Security Checklist



- Change `HOST_PASSWORD` to a strong password

- Set a unique `JWT_SECRET` (32+ random characters)  ### 4. Collaboration Features```## Quick Start- 📊 Asynchronous brainstorming and ideation

- Use HTTPS for all connections

- Configure CORS properly for your domainAI personas are instructed to:

- Rotate API keys regularly

- Build on others' ideas

### Build and Deploy

- Find common ground and compromise  

Build the project:

```bash- Make concessions when appropriateEdit `backend/.env` with your API keys:

npm run build

```- Propose integrated solutions



Start the production server:- Support valid points from others```env

```bash

npm run start- Avoid repetition and circular arguments

```

GEMINI_API_KEY=your-api-key-here### Prerequisites### Repository layout

### Database Backup

## Configuration

Create daily backups:

```bashGEMINI_MODERATOR_API_KEY=your-moderator-api-key-here

cp backend/backend/data/a2mp.db backups/a2mp-backup-$(date +%Y%m%d).db

```Create `backend/.env` with your settings. See `backend/.env.example` for a complete template.



## Development```- Node.js 20+



### Available Scripts### Required Settings



Run both backend and frontend:

```bash

npm run dev```bash

```

# Google Gemini API Keys (REQUIRED)### 3. Run Development Server- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))**Key Features:**

Build for production:

```bashGEMINI_API_KEY=your-api-key-here

npm run build  

```GEMINI_MODERATOR_API_KEY=your-moderator-api-key-here



Start production build:```

```bash

npm run start```bash

```

### Server Configuration

Format code with Prettier:

```bashnpm run dev

npm run format

``````bash



### Code StructurePORT=4000```### Installation- ✅ AI personas generated from participant inputs**Perfect for:**- `backend/`: Express API + Socket.IO realtime + conversation engine, SQLite persistence



- `backend/src/services/` - Business logicCORS_ORIGIN=http://localhost:5174

- `backend/src/llm/` - Gemini integration

- `backend/src/realtime.ts` - Socket.IO real-time system```

- `nextjs-frontend/app/` - Next.js 14 app router pages

- `nextjs-frontend/components/` - Reusable UI components

- `check-*.js` - Debugging utilities

### Host AuthenticationThis starts:

## Tech Stack



- **Backend**: Node.js, Express, TypeScript, SQLite

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS```bash- 🔧 Backend API on http://localhost:4000

- **Real-time**: Socket.IO WebSockets

- **AI**: Google Gemini 2.5 FlashHOST_PASSWORD=your-secure-password

- **Database**: SQLite with better-sqlite3

JWT_SECRET=your-jwt-secret-key- 🎨 Frontend UI on http://localhost:5174```bash- ✅ Natural conversational flow with turn-taking

## Rate Limiting

```

Dual API key system for better quota management:



- **Participant Key**: Persona generation/responses (250 req/day)

- **Moderator Key**: Turn decisions/conclusions (250 req/day)  ### AI Model Settings

- **Total**: 500+ requests per day

- **Per Key**: 10 RPM, 250K TPM, 250 RPD### 4. Create Your First Meetinggit clone <your-repo-url>



## License```bash



Proprietary. Evaluation only. See `LICENSE` for details.GEMINI_MODEL=gemini-2.5-flash



## CreditsENGINE_TICK_MS=15000



Built with Google Gemini API, Express, React, Next.js, Socket.IO, Vite, TypeScript, and better-sqlite3.MAX_TURNS_PER_MEETING=101. Open http://localhost:5174cd Asynchronous-AI-Meeting-Platform- ✅ Automatic pause when human input needed- 🗳️ Distributed decision-making across time zones- `frontend/`: Vite + React UI that proxies to `backend`



---```



**Made with ❤️ for asynchronous collaboration**2. Log in as host (default password: `password`)

### Email (Optional)

3. Create a meeting with 2+ participants  

```bash

SMTP_HOST=smtp.gmail.com4. Share participant links

SMTP_PORT=587

SMTP_USER=your-email@gmail.com5. Submit inputs as each participant# Install dependencies- ✅ Real-time conversation streaming

SMTP_PASS=your-app-password

MAIL_FROM=noreply@yourdomain.com6. Watch the AI conversation unfold in real-time!

```

npm install

See full configuration details in the `.env.example` file.

## How It Works

## Usage Guide

npm install --prefix backend- ✅ Collaborative whiteboard tracking- 💼 Budget planning with multiple stakeholders- `server/`: Alternative Express API (consolidated variant), SQLite persistence

### Creating a Meeting

### 1. Persona Generation

1. Log in as host

2. Enter meeting subject and contextEach participant's input is analyzed to create a unique AI persona with:npm install --prefix frontend

3. Add participant emails

4. Click "Create Meeting & Invite"- Identity and role description

5. Participants submit via unique links

6. Meeting starts automatically- Objectives and priorities  ```- ✅ Automatic report generation



### Watching Live- Communication style



- **Host View**: See all turns, whiteboard, inject messages- Model Context Protocol (MCP) instructions

- **Participant View**: Watch conversation after submission, inject when paused



### Human Interjection

### 2. Real-Time Conversation Engine### Configuration- ✅ Smart repetition detection- 🎯 Strategic planning sessions- `web/`: Vite + React UI targeting `server`

- Meetings pause when conversation gets stuck

- Host or participants can inject guidanceThe engine runs continuously and:

- Meeting resumes automatically after input

- Messages are visually distinguished (green for human, blue for AI)- Monitors meetings in "running" status



## API Endpoints- Uses AI moderator to decide next speaker



### Meetings- Generates responses from selected personas```bash- ✅ Dual API key support for quota isolation

- `POST /api/meetings` - Create meeting

- `GET /api/meetings/:id/status` - Get status with conversation  - Detects repetition patterns and pauses if stuck

- `POST /api/meetings/:id/inject` - Inject human message

- `POST /api/meetings/:id/advance` - Advance one turn (host)- Broadcasts updates via Socket.IO WebSockets# Copy the example file

- `GET /api/meetings/:id/report` - Get complete report with transcript

- Checks for natural conclusion points

### Participants

- `GET /api/participant?token=xxx` - Get participant detailscp backend/.env.example backend/.env- 🤝 Conflict resolution and compromise building- `LICENSE`: Proprietary, evaluation‑only license

- `POST /api/participant/submit` - Submit input

### 3. Smart Turn-Taking

### Authentication

- `POST /api/auth/host/login` - Host loginModerator uses priority logic:```



### Real-time1. **Direct Questions**: If AI asks another AI a question, let them respond

- **Socket.IO Events**: `turn`, `status`, `whiteboard` for live updates

- **WebSocket Connection**: Automatic room joining and broadcasting2. **First-Time Speakers**: Give everyone a chance before repeating---



## Debugging Tools3. **Alternation**: Prefer switching speakers (A→B→A→B)



View conversation:4. **Free Choice**: Any speaker if no constraints Edit `backend/.env` and set your API keys:

```bash

node check-conversation.js [meetingId]

```

### 4. Collaboration Features```env- 📊 Asynchronous brainstorming and ideation

View report:

```bashAI personas are instructed to:

node check-report.js [meetingId]  

```- Build on others' ideasGEMINI_API_KEY=your-api-key-here



List meetings:- Find common ground and compromise  

```bash

node list-meetings.js- Make concessions when appropriateGEMINI_MODERATOR_API_KEY=your-moderator-api-key-here## Quick Start

```

- Propose integrated solutions

View database:

```bash- Support valid points from others```

node check-db.js

```- Avoid repetition and circular arguments



Check quota:### Requirements

```bash

node check-quota.js## Configuration

```

### Run

## Troubleshooting

Create `backend/.env` with your settings. See `backend/.env.example` for a complete template.

### Meeting Not Starting

### Prerequisites

Check that all participants have submitted:

```bash### Required Settings

node list-meetings.js

``````bash



Verify engine logs run every 15 seconds in the terminal.```bash



### API Key Issues# Google Gemini API Keys (REQUIRED)npm run dev- **Node.js 20+** (required)**Key Features:**- Node.js 18+ (Node 20+ recommended)



Verify your keys at [Google AI Studio](https://makersuite.google.com/app/apikey)GEMINI_API_KEY=your-api-key-here



Check quota:GEMINI_MODERATOR_API_KEY=your-moderator-api-key-here```

```bash

node check-quota.js```

```

- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

Both keys must be set in your `.env` file.

### Server Configuration

### Personas Repeating

- Backend: http://localhost:4000

Anti-repetition mechanisms are included. If personas still repeat, try:

- More diverse participant inputs```bash

- Check conversation history:

  ```bashPORT=4000- Frontend: http://localhost:5174- Optional: SMTP credentials for email invitations- ✅ AI personas generated from participant inputs

  node check-conversation.js

  ```CORS_ORIGIN=http://localhost:5174



### Real-time Updates Not Working```



- Ensure Socket.IO connection is established (check browser console)

- Verify WebSocket connections aren't blocked by firewall

- Check that backend Socket.IO server is running on port 4000### Host Authentication### First Meeting



### Report Missing Transcript



The report API now includes the full conversation transcript. If transcript is missing:```bash

- Ensure the meeting is completed

- Check backend logs for report generation errorsHOST_PASSWORD=your-secure-password

- Verify conversation data exists using `node check-conversation.js [meetingId]`

JWT_SECRET=your-jwt-secret-key1. Open http://localhost:5174### 1. Clone & Install- ✅ Natural conversational flow with turn-taking---

### No Report Generated

```

Check the report:

```bash2. Login as host (password: `password`)

node check-report.js [meetingId]

```### AI Model Settings



Verify meeting status is "completed" and review server logs for errors.3. Create a meeting with 2+ participants



## Production Deployment```bash



### Security ChecklistGEMINI_MODEL=gemini-2.5-flash4. Share participant links



- Change `HOST_PASSWORD` to a strong passwordENGINE_TICK_MS=15000

- Set a unique `JWT_SECRET` (32+ random characters)  

- Use HTTPS for all connectionsMAX_TURNS_PER_MEETING=105. Submit inputs as each participant```bash- ✅ Automatic pause when human input needed

- Configure CORS properly for your domain

- Rotate API keys regularly```



### Build and Deploy6. Watch the AI conversation



Build the project:### Email (Optional)

```bash

npm run buildgit clone <your-repo-url>

```

```bash

Start the production server:

```bashSMTP_HOST=smtp.gmail.com---

npm run start

```SMTP_PORT=587



### Database BackupSMTP_USER=your-email@gmail.comcd Asynchronous-AI-Meeting-Platform- ✅ Real-time conversation streaming## Option A: Run backend + frontend (recommended)



Create daily backups:SMTP_PASS=your-app-password

```bash

cp backend/backend/data/a2mp.db backups/a2mp-backup-$(date +%Y%m%d).dbMAIL_FROM=noreply@yourdomain.com## How It Works

```

```

## Development

npm install

### Available Scripts

See full configuration details in the `.env.example` file.

Run both backend and frontend:

```bash### Persona Generation

npm run dev

```## Usage Guide



Build for production:Each participant's input is analyzed to create a unique AI persona with:npm install --prefix backend- ✅ Collaborative whiteboard trackingThis pair is wired together via Vite dev proxy and root scripts.

```bash

npm run build  ### Creating a Meeting

```

- Identity and role description

Start production build:

```bash1. Log in as host

npm run start

```2. Enter meeting subject and context- Objectives and prioritiesnpm install --prefix frontend



Format code with Prettier:3. Add participant emails

```bash

npm run format4. Click "Create Meeting & Invite"- Communication style

```

5. Participants submit via unique links

### Code Structure

6. Meeting starts automatically- Model Context Protocol (MCP) instructions```- ✅ Automatic report generation

- `backend/src/services/` - Business logic

- `backend/src/llm/` - Gemini integration

- `backend/src/realtime.ts` - Socket.IO real-time system

- `frontend/src/pages/` - UI components### Watching Live

- `nextjs-frontend/` - Next.js UI with real-time features

- `check-*.js` - Debugging utilities



### Alternative Stack- **Host View**: See all turns, whiteboard, inject messages### Conversation Engine



This repository includes two parallel implementations:- **Participant View**: Watch conversation after submission, inject when paused



- **backend + frontend** (recommended): Express API + Vite React UIRuns every 15 seconds (configurable):

- **server + web**: Consolidated API + separate React UI

### Human Interjection

Both support the same features with different architectural approaches.

- Checks for meetings in "running" status### 2. Configure Environment- ✅ Smart repetition detection### Install

## Tech Stack

- Meetings pause when conversation gets stuck

- **Backend**: Node.js, Express, TypeScript, SQLite

- **Frontend**: React, TypeScript, Vite / Next.js 14- Host or participants can inject guidance- Moderator decides next speaker

- **Real-time**: Socket.IO WebSockets

- **AI**: Google Gemini 2.5 Flash- Meeting resumes automatically after input

- **Database**: SQLite with better-sqlite3

- Messages are visually distinguished (green for human, blue for AI)- Generates AI response

## Rate Limiting



Dual API key system for better quota management:

## API Endpoints- Detects repetition patterns

- **Participant Key**: Persona generation/responses (250 req/day)

- **Moderator Key**: Turn decisions/conclusions (250 req/day)  

- **Total**: 500+ requests per day

- **Per Key**: 10 RPM, 250K TPM, 250 RPD### Meetings- Checks for natural conclusion```bash- ✅ Dual API key support for quota isolationFrom the repo root:



## License- `POST /api/meetings` - Create meeting



Proprietary. Evaluation only. See `LICENSE` for details.- `GET /api/meetings/:id/status` - Get status with conversation  



## Credits- `POST /api/meetings/:id/inject` - Inject human message



Built with Google Gemini API, Express, React, Next.js, Socket.IO, Vite, TypeScript, and better-sqlite3.- `POST /api/meetings/:id/advance` - Advance one turn (host)### Smart Turn-Taking# Copy the example file



---



**Made with ❤️ for asynchronous collaboration**### Participants1. **Direct Questions**: If an AI asks another a question, let them respond

- `GET /api/participant?token=xxx` - Get participant details

- `POST /api/participant/submit` - Submit input2. **First-Time Speakers**: Everyone speaks before anyone repeatscp backend/.env.example backend/.env```bash



### Authentication3. **Alternation**: Prefers A→B→A→B pattern

- `POST /api/auth/host/login` - Host login

4. **Free Choice**: Any speaker if no constraints

### Real-time

- **Socket.IO Events**: `turn`, `status`, `whiteboard` for live updates

- **WebSocket Connection**: Automatic room joining and broadcasting

### Collaboration# Edit backend/.env with your API keys---# root dev tooling (concurrently, prettier)

## Debugging Tools

AI personas are instructed to:

View conversation:

```bash- Build on others' ideas# At minimum, set:

node check-conversation.js [meetingId]

```- Find common ground



View report:- Make concessions when appropriate# - GEMINI_API_KEYnpm install

```bash

node check-report.js [meetingId]  - Propose integrated solutions

```

- Avoid repeating themselves# - GEMINI_MODERATOR_API_KEY (or use same as above)

List meetings:

```bash

node list-meetings.js

```---```## Quick Start# app dependencies



View database:

```bash

node check-db.js## Configuration

```



Check quota:

```bashSee `backend/.env.example` for complete template.### 3. Run Development Servernpm install --prefix backend

node check-quota.js

```



## Troubleshooting**Required:**



### Meeting Not Starting```env



Check that all participants have submitted:GEMINI_API_KEY=your-api-key-here```bash### Prerequisitesnpm install --prefix frontend

```bash

node list-meetings.jsGEMINI_MODERATOR_API_KEY=your-moderator-api-key-here

```

```npm run dev

Verify engine logs run every 15 seconds in the terminal.



### API Key Issues

**Server:**```- **Node.js 20+** (required)```

Verify your keys at [Google AI Studio](https://makersuite.google.com/app/apikey)

```env

Check quota:

```bashPORT=4000

node check-quota.js

```CORS_ORIGIN=http://localhost:5174



Both keys must be set in your `.env` file.HOST_PASSWORD=your-secure-passwordThis starts:- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))



### Personas RepeatingJWT_SECRET=your-jwt-secret-key



Anti-repetition mechanisms are included. If personas still repeat, try:```- 🔧 Backend API on http://localhost:4000

- More diverse participant inputs

- Check conversation history:

  ```bash

  node check-conversation.js**AI Settings:**- 🎨 Frontend UI on http://localhost:5174- Optional: SMTP credentials for email invitations### Configure environment (optional but recommended)

  ```

```env

### Real-time Updates Not Working

GEMINI_MODEL=gemini-2.5-flash

- Ensure Socket.IO connection is established (check browser console)

- Verify WebSocket connections aren't blocked by firewallENGINE_TICK_MS=15000

- Check that backend Socket.IO server is running on port 4000

MAX_TURNS_PER_MEETING=10### 4. Create Your First MeetingCreate `backend/.env` with any overrides:

### No Report Generated

```

Check the report:

```bash

node check-report.js [meetingId]

```**Email (Optional):**



Verify meeting status is "completed" and review server logs for errors.```env1. Open http://localhost:5174### 1. Clone & Install```bash



## Production DeploymentSMTP_HOST=smtp.gmail.com



### Security ChecklistSMTP_PORT=5872. Log in as host (default password: `password`)



- Change `HOST_PASSWORD` to a strong passwordSMTP_USER=your-email@gmail.com

- Set a unique `JWT_SECRET` (32+ random characters)  

- Use HTTPS for all connectionsSMTP_PASS=your-app-password3. Create a meeting with 2 participants```bash# Backend API

- Configure CORS properly for your domain

- Rotate API keys regularlyMAIL_FROM=noreply@yourdomain.com



### Build and Deploy```4. Share participant links



Build the project:

```bash

npm run build---5. Submit inputs as participantsgit clone <your-repo-url>PORT=4000

```



Start the production server:

```bash## API Endpoints6. Watch the AI conversation unfold!

npm run start

```



### Database Backup**Meetings:**cd Asynchronous-AI-Meeting-PlatformCORS_ORIGIN=http://localhost:5173



Create daily backups:- `POST /api/meetings` - Create meeting

```bash

cp backend/backend/data/a2mp.db backups/a2mp-backup-$(date +%Y%m%d).db- `GET /api/meetings/:id/status` - Get status with conversation---

```

- `POST /api/meetings/:id/inject` - Inject human message

## Development

- `POST /api/meetings/:id/advance` - Advance one turn (host)npm install

### Available Scripts



Run both backend and frontend:

```bash**Participants:**## How It Works

npm run dev

```- `GET /api/participant?token=xxx` - Get participant details



Build for production:- `POST /api/participant/submit` - Submit inputnpm install --prefix backend# Host auth

```bash

npm run build  

```

**Authentication:**### 1. Persona Generation

Start production build:

```bash- `POST /api/auth/host/login` - Host login

npm run start

```When a participant submits input, the system:npm install --prefix frontendHOST_PASSWORD=change-me



Format code with Prettier:**Real-time:**

```bash

npm run format- `GET /api/meetings/:id/stream` - SSE for live updates- Analyzes their perspective and priorities

```



### Code Structure

---- Generates a unique AI persona with identity, objectives, and communication style```JWT_SECRET=dev-secret-change-me

- `backend/src/services/` - Business logic

- `backend/src/llm/` - Gemini integration

- `backend/src/realtime.ts` - Socket.IO real-time system

- `frontend/src/pages/` - UI components## Debugging Tools- Creates Model Context Protocol (MCP) instructions for the persona

- `nextjs-frontend/` - Next.js UI with real-time features

- `check-*.js` - Debugging utilities



### Alternative Stack```bash



This repository includes two parallel implementations:node check-conversation.js [meetingId]  # View conversation



- **backend + frontend** (recommended): Express API + Vite React UInode check-report.js [meetingId]        # View report### 2. Conversation Engine

- **server + web**: Consolidated API + separate React UI

node list-meetings.js                   # List all meetings

Both support the same features with different architectural approaches.

node check-db.js                        # View databaseThe engine runs on a timer (default: every 15 seconds):### 2. Configure Environment# LLM (Google Gemini)

## Tech Stack

node check-quota.js                     # Check API quota

- **Backend**: Node.js, Express, TypeScript, SQLite

- **Frontend**: React, TypeScript, Vite / Next.js 14```- Checks for meetings in "running" status

- **Real-time**: Socket.IO WebSockets

- **AI**: Google Gemini 2.5 Flash

- **Database**: SQLite with better-sqlite3

---- Calls moderator to decide next speaker```bashGEMINI_API_KEY=your-gemini-api-key

## Rate Limiting



Dual API key system for better quota management:

## Troubleshooting- Generates AI response from selected persona

- **Participant Key**: Persona generation/responses (250 req/day)

- **Moderator Key**: Turn decisions/conclusions (250 req/day)  

- **Total**: 500+ requests per day

- **Per Key**: 10 RPM, 250K TPM, 250 RPD**Meeting Not Starting**- Detects repetition patterns and pauses if stuck# Copy the example fileGEMINI_MODEL=gemini-1.5-pro



## License- Verify all participants submitted



Proprietary. Evaluation only. See `LICENSE` for details.- Check: `node list-meetings.js`- Checks for natural conclusion points



## Credits- Engine logs should run every 15 seconds



Built with Google Gemini API, Express, React, Next.js, Socket.IO, Vite, TypeScript, and better-sqlite3.cp backend/.env.example backend/.env



---**API Key Issues**



**Made with ❤️ for asynchronous collaboration**- Verify at [Google AI Studio](https://makersuite.google.com/app/apikey)### 3. Smart Turn-Taking

- Check quota: `node check-quota.js`

- Both keys must be set in `.env`Moderator uses priority logic:# Email (SMTP); if omitted, dev uses a JSON/log transport



**Personas Repeating**1. **Direct Questions**: If AI asks another AI a question, let them respond

- Try more diverse participant inputs

- Check: `node check-conversation.js`2. **First-Time Speakers**: Give everyone a chance before repeating# Edit backend/.env with your API keysSMTP_HOST=



**No Report Generated**3. **Alternation**: Prefer switching speakers (A→B→A→B)

- Check: `node check-report.js [meetingId]`

- Verify meeting status is "completed"4. **Free Choice**: Any speaker if no constraints# At minimum, set:SMTP_PORT=587


=======
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
>>>>>>> 79e53290a585ba334eb8e4ff5fabb98058e43c69

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

## Development Scripts

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

