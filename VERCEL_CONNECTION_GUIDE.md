# Backend Deployment & Frontend Connection Guide

## Overview
Your Vercel frontend is ready! Now you need to deploy your backend and connect them together.

## 1. Deploy Backend

### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select this repository
4. Choose the `backend` folder as the root directory
5. Railway will auto-detect Node.js and deploy

### Option B: Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Set these configurations:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18 or higher

## 2. Configure Backend Environment Variables

In your hosting platform (Railway/Render), add these environment variables from `backend/.env.production`:

### Required Variables:
```bash
CORS_ORIGIN=https://your-frontend.vercel.app
GEMINI_API_KEY=your_actual_gemini_api_key
JWT_SECRET=generate_a_32_character_secret
HOST_EMAIL=your-email@gmail.com
PORT=4000
NODE_ENV=production
```

### Optional Email Variables (for participant invites):
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="A²MP System <your-email@gmail.com>"
```

## 3. Update Frontend Environment

After your backend is deployed, you'll get a URL like:
- Railway: `https://your-app-name.railway.app`
- Render: `https://your-app-name.onrender.com`

### Update Vercel Environment Variables:
1. In your Vercel dashboard, go to your project settings
2. Go to "Environment Variables"
3. Add: `VITE_API_BASE_URL` = `https://your-backend-url`
4. Redeploy your frontend

## 4. Update CORS Configuration

Go back to your backend hosting platform and update:
```bash
CORS_ORIGIN=https://your-actual-vercel-app.vercel.app
```

## 5. Test the Connection

1. Open your Vercel frontend URL
2. Try creating a meeting - this will test backend connectivity
3. Check browser developer tools for any CORS or connection errors

## 6. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Click "Get API Key"
3. Create a new API key or use an existing one
4. Add it to your backend environment variables as `GEMINI_API_KEY`

## Common Issues & Solutions

### CORS Errors
- Make sure `CORS_ORIGIN` exactly matches your Vercel URL (no trailing slash)
- Include both production and preview URLs: `https://your-app.vercel.app,https://your-app-git-main.vercel.app`

### API Connection Errors
- Verify `VITE_API_BASE_URL` is correctly set in Vercel
- Check that your backend is running (visit the backend URL directly)
- Ensure there's no trailing slash in the API base URL

### Database Issues
- The SQLite database will be created automatically on first run
- For persistent storage, consider upgrading to PostgreSQL on your hosting platform

### Environment Variable Updates
- Remember to redeploy after changing environment variables
- Railway: Auto-redeploys on variable changes
- Render: May need manual redeploy

## Ready to Test!

Once both frontend and backend are deployed with correct environment variables:

1. **Frontend**: https://your-app.vercel.app
2. **Backend**: https://your-backend.railway.app (or render.com)
3. **API Endpoint Example**: https://your-backend.railway.app/api/health

Your A²MP (Asynchronous AI Meeting Platform) should now be fully functional!