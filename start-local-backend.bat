@echo off
echo Starting A2MP Local Backend + ngrok Tunnel
echo ==========================================

echo.
echo Step 1: Starting backend server...
cd /d "%~dp0backend"
start "A2MP Backend" cmd /k "npm start"

echo.
echo Step 2: Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Step 3: Starting ngrok tunnel...
echo NOTE: Make sure you have ngrok installed and authenticated
echo.
echo If you don't have ngrok:
echo 1. Download from: https://ngrok.com/download
echo 2. Run: ngrok authtoken YOUR_TOKEN
echo.
pause

start "ngrok Tunnel" cmd /k "ngrok http 4000"

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo 1. Backend: http://localhost:4000
echo 2. Copy the ngrok HTTPS URL from the tunnel window
echo 3. Update Vercel environment variable VITE_API_BASE_URL
echo 4. Redeploy your Vercel frontend
echo.
echo Press any key to exit...
pause > nul