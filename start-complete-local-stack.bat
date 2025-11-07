@echo off
echo Starting A2MP Complete Local Development Stack...
echo.
echo Stopping any existing Node processes...
taskkill /f /im node.exe >nul 2>&1

timeout /t 2

echo Starting Backend (Port 4000)...
start cmd /k "cd /d c:\Users\Howfl\OneDrive\Documents\Projects\A2MP\Asynchronous-AI-Meeting-Platform\backend && npm run dev"

timeout /t 5

echo Starting Next.js Frontend (Port 3000)...
start cmd /k "cd /d c:\Users\Howfl\OneDrive\Documents\Projects\A2MP\Asynchronous-AI-Meeting-Platform\nextjs-frontend && npm run dev"

echo.
echo ===================================
echo A2MP Development Stack Started!
echo ===================================
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul