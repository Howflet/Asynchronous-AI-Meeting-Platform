# Frontend Options Updated

## Two Frontend Directories Available

Your project now has **two working frontends** that are both compatible with your current backend:

### 1. `/frontend/` Directory (Recommended for Vercel)
- **Technology**: React + TypeScript + Vite
- **API Integration**: Centralized axios configuration via `src/api.ts`
- **Features**: 
  - Full authentication system
  - Real-time meeting status updates
  - Participant conversation view
  - Host controls (pause/resume/advance)
  - Message injection
  - Meeting reports
- **Deployment**: Ready for Vercel deployment
- **Environment**: Uses `VITE_API_BASE_URL`

### 2. `/web/` Directory (Updated & Compatible)
- **Technology**: React + TypeScript + Vite + Mermaid diagrams
- **API Integration**: Direct fetch calls with environment-based URL
- **Features**:
  - Meeting creation with email invitations
  - Token-based participant input system
  - Live meeting view with polling
  - Visual reports with Mermaid diagrams
  - Voice input support (browser Speech Recognition)
- **Deployment**: Can be deployed to any static hosting
- **Environment**: Uses `VITE_API_BASE`

## What Was Updated in `/web/` Directory

### API Endpoints Updated:
- **Port Changed**: `8080` → `4000` to match current backend
- **Participant System**: Updated from `/api/invite/${code}` to token-based `/api/participant?token=${token}`
- **Meeting Creation**: Added required `participantBaseUrl` field
- **Status Polling**: Updated to use `/api/meetings/:id/status` instead of SSE streams
- **Input Submission**: Updated to use `/api/participant/submit` with token

### New Features Added:
- **Environment Configuration**: Added `.env` file with `VITE_API_BASE`
- **TypeScript Support**: Added proper type declarations for `import.meta.env`
- **Error Handling**: Improved error states and user feedback
- **Name Support**: Added optional participant name input
- **Input Validation**: Minimum 10 characters for participant input

### Fixed Components:
- **HostPage**: Updated API calls, removed deprecated "start" button
- **ParticipantPage**: Complete rewrite for token-based system
- **LivePage**: Updated to poll `/api/meetings/:id/status` every 2 seconds
- **ReportPage**: Fixed visual map field name, added error handling

## Choosing Between Frontends

### Use `/frontend/` if:
- You want the most feature-complete experience
- You're deploying to Vercel (already configured)
- You need authentication and host controls
- You prefer centralized API configuration

### Use `/web/` if:
- You prefer the visual Mermaid diagrams in reports
- You want voice input support
- You like the simpler, more direct code structure
- You're deploying to a different platform

## Environment Setup

Both frontends are configured to work with your backend:

### Local Development:
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173` (frontend) or `http://localhost:5174` (web)

### Production Deployment:
1. Deploy backend to Railway/Render
2. Update environment variable in your chosen frontend:
   - `/frontend/`: Update `VITE_API_BASE_URL`
   - `/web/`: Update `VITE_API_BASE`

## Build Commands

Both frontends build successfully:

```bash
# Frontend directory
cd frontend && npm run build

# Web directory  
cd web && npm run build
```

## Next Steps

1. **Choose your preferred frontend** (`/frontend/` or `/web/`)
2. **Deploy your backend** (Railway recommended)
3. **Update environment variables** with your backend URL
4. **Deploy your chosen frontend**
5. **Test the complete flow** from meeting creation to reports

Both frontends are now fully compatible with your current backend API! 🎉