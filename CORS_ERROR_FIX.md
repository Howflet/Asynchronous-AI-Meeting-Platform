# CORS Error Fix Guide

## Problem
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://your-backend.railway.app/api/auth/login. (Reason: CORS header 'Access-Control-Allow-Origin' does not match 'https://railway.com').
```

## Root Cause
Your backend CORS configuration doesn't match your frontend URL.

## Solution

### Step 1: Get Your Actual URLs

#### Backend URL (Railway):
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your A2MP backend project
3. Look for the deployment URL (e.g., `https://a2mp-backend-production-1234.up.railway.app`)

#### Frontend URL (Vercel):
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your A2MP frontend project  
3. Look for the deployment URL (e.g., `https://your-app-git-main-username.vercel.app`)

### Step 2: Update Backend CORS (Railway)

1. In Railway dashboard, go to your backend service
2. Go to **Variables** tab
3. Update `CORS_ORIGIN` to:
   ```
   https://your-actual-frontend.vercel.app,http://localhost:3000,http://localhost:5173
   ```
   **Replace with your ACTUAL Vercel URL!**

4. Save and redeploy

### Step 3: Update Frontend API URL (Vercel)

1. In Vercel dashboard, go to your frontend project
2. Go to **Settings** → **Environment Variables**
3. Update `VITE_API_BASE_URL` to:
   ```
   https://your-actual-backend.railway.app
   ```
   **Replace with your ACTUAL Railway URL!**

4. Redeploy frontend

### Step 4: Test CORS Directly

Test if CORS is working by visiting:
```
https://your-actual-backend.railway.app/api/health
```

This should return: `{"ok":true}`

### Common CORS Values

```bash
# For production (replace with actual URLs):
CORS_ORIGIN=https://a2mp-frontend.vercel.app,https://a2mp-frontend-git-main.vercel.app

# For development + production:
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3000,http://localhost:5173

# For testing only (INSECURE - don't use in production):
CORS_ORIGIN=*
```

### Step 5: Verify Environment Variables

After updating, check your environment variables:

**Backend (Railway):**
- `CORS_ORIGIN` = your actual frontend URL(s)
- `PORT` = 4000
- `GEMINI_API_KEY` = your actual API key

**Frontend (Vercel):**
- `VITE_API_BASE_URL` = your actual backend URL

### Step 6: Force Redeploy

After updating environment variables:
1. **Railway**: Trigger a new deployment
2. **Vercel**: Trigger a new deployment

### Debugging Tips

1. **Check Network Tab**: Open browser dev tools → Network tab to see actual request URLs
2. **Check Console**: Look for detailed CORS error messages
3. **Test Backend Directly**: Visit `https://your-backend-url.railway.app/api/health`
4. **Check Environment**: Ensure environment variables are actually loaded

## Quick Test URLs

Replace with your actual URLs and test these:

```bash
# Test backend health
curl https://your-actual-backend.railway.app/api/health

# Test CORS from browser console (replace URLs)
fetch('https://your-actual-backend.railway.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

## Still Having Issues?

If you're still getting CORS errors:

1. **Temporarily set CORS_ORIGIN=* in Railway** (for testing only)
2. **Check the actual URLs in browser dev tools**
3. **Ensure both services are actually deployed and running**
4. **Check Railway logs for any backend errors**