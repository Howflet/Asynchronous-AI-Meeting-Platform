# Vercel Frontend Pages & Backend Integration

## 📄 Required Pages for Full A²MP Functionality

### **1. 🏠 Home Page** 
- **URL:** `https://a2mp.vercel.app/`
- **Purpose:** Landing page with platform overview
- **Backend Calls:** None
- **User Type:** Public
- **Features:**
  - Welcome message
  - Platform description
  - Navigation to Host/Participant flows

---

### **2. 🎯 Host Page (Admin Dashboard)**
- **URL:** `https://a2mp.vercel.app/host`
- **Purpose:** Meeting creation and management dashboard
- **User Type:** Authenticated Hosts
- **Backend Endpoints Used:**
  - `POST /api/auth/login` - Host authentication
  - `POST /api/meetings` - Create new meetings
  - `GET /api/meetings/:id/participants` - Get participant tokens
  - `GET /api/meetings/:id/status` - Poll conversation status
  - `POST /api/meetings/:id/pause` - Pause meeting
  - `POST /api/meetings/:id/resume` - Resume meeting  
  - `POST /api/meetings/:id/advance` - Manual AI turn advance
  - `POST /api/meetings/:id/inject` - Inject host messages

**Features:**
- **Login Form:** Password authentication (password: `12345`)
- **Meeting Creator:** Subject, details, participant emails
- **Live Meeting Monitor:** Real-time conversation view
- **Meeting Controls:** Pause/Resume/Advance buttons
- **Message Injection:** Host can add messages mid-conversation
- **Participant Links:** Display invitation URLs for sharing

---

### **3. 👥 Participant Page**
- **URL:** `https://a2mp.vercel.app/p?token=<invitation-token>`
- **Purpose:** Participant input submission and conversation viewing
- **User Type:** Invited Participants (token-based access)
- **Backend Endpoints Used:**
  - `GET /api/participant?token=<token>` - Get participant details
  - `POST /api/participant/submit` - Submit initial input
  - `GET /api/meetings/:id/status` - Poll conversation updates
  - `POST /api/meetings/:id/inject` - Inject participant messages

**Features:**
- **Token Validation:** Verify invitation link
- **Input Form:** Submit initial thoughts/ideas
- **Name Field:** Optional participant display name
- **Live Conversation View:** Watch AI discussion in real-time
- **Message Injection:** Participants can interject during discussion

---

### **4. 📺 Meeting Live View**
- **URL:** `https://a2mp.vercel.app/m/:meetingId`
- **Purpose:** Public live view of meeting conversation
- **User Type:** Anyone with meeting ID
- **Backend Endpoints Used:**
  - `GET /api/meetings/:id/status` - Get conversation history
  - `POST /api/meetings/:id/inject` - Inject messages

**Features:**
- **Live Conversation:** Real-time AI discussion display
- **Message Injection:** Anyone can add messages
- **Status Indicators:** Show meeting state (running/paused/completed)

---

### **5. 📊 Report Page**
- **URL:** `https://a2mp.vercel.app/r/:meetingId`
- **Purpose:** Final meeting summary and insights
- **User Type:** Anyone with meeting ID
- **Backend Endpoints Used:**
  - `GET /api/meetings/:id/report` - Get final report

**Features:**
- **Meeting Summary:** AI-generated overview
- **Key Insights:** Highlights and important points
- **Decisions Made:** Concrete decisions from discussion
- **Action Items:** Next steps identified
- **Visual Map:** Mermaid diagram of conversation flow

---

## 🔄 User Flow Mapping

### **Host Flow:**
```
1. https://a2mp.vercel.app/host
   ↓ Login (password: 12345)
2. Create Meeting Form
   ↓ Submit details + participant emails
3. Meeting Dashboard
   ↓ Monitor conversation, control meeting
4. https://a2mp.vercel.app/r/:id
   ↓ View final report when complete
```

### **Participant Flow:**
```
1. Receive email invitation
   ↓ Click link with token
2. https://a2mp.vercel.app/p?token=abc123
   ↓ Submit initial input
3. Wait for AI conversation
   ↓ Watch live discussion
4. https://a2mp.vercel.app/r/:id
   ↓ View final report
```

### **Public Viewer Flow:**
```
1. Receive meeting link
   ↓ Open live view
2. https://a2mp.vercel.app/m/:id
   ↓ Watch conversation, optionally inject messages
3. https://a2mp.vercel.app/r/:id
   ↓ View final report
```

---

## 🌐 Required Environment Variables

### **Vercel Environment Variables:**
```bash
VITE_API_BASE_URL=https://ninety-bags-thank.loca.lt
```

### **Backend (.env) Requirements:**
```bash
CORS_ORIGIN=https://a2mp.vercel.app,http://localhost:3000,https://ninety-bags-thank.loca.lt
HOST_PASSWORD=12345
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
```

---

## 🔗 URL Structure Summary

| Page Type | URL Pattern | Authentication | Backend Calls |
|-----------|-------------|----------------|---------------|
| **Home** | `/` | None | None |
| **Host Dashboard** | `/host` | JWT (password) | 8 endpoints |
| **Participant** | `/p?token=xyz` | Token-based | 4 endpoints |
| **Live Meeting** | `/m/:meetingId` | None | 2 endpoints |
| **Report** | `/r/:meetingId` | None | 1 endpoint |

---

## ✅ Vercel Deployment Checklist

### **Pages Required:**
- ✅ Home (`/`) - Landing page
- ✅ Host (`/host`) - Admin dashboard with login
- ✅ Participant (`/p`) - Token-based participant interface
- ✅ Meeting Live (`/m/:id`) - Public meeting view
- ✅ Report (`/r/:id`) - Final meeting reports

### **Environment Setup:**
- ✅ Set `VITE_API_BASE_URL` to your tunnel URL
- ✅ Ensure backend CORS includes Vercel domain
- ✅ Test all pages can reach backend endpoints

### **Key Features Working:**
- ✅ Host login with password `12345`
- ✅ Meeting creation with participant emails
- ✅ Participant token-based access
- ✅ Real-time conversation polling
- ✅ Meeting controls (pause/resume/advance)
- ✅ Message injection for hosts and participants
- ✅ Final report generation and viewing

**All 5 pages work together to create the complete A²MP experience!** 🚀