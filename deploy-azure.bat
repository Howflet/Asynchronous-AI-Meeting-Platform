@echo off
echo ===========================================
echo    A²MP Azure Deployment Helper
echo ===========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as administrator... OK
) else (
    echo This script requires administrator privileges.
    echo Please run as administrator.
    pause
    exit /b 1
)

echo.
echo Before running this deployment, please ensure you have:
echo 1. Azure CLI installed
echo 2. Docker Desktop running
echo 3. Your Gemini API keys ready
echo 4. An active Azure subscription
echo.

set /p CONTINUE="Do you want to continue? (y/N): "
if /i not "%CONTINUE%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
set /p SUBSCRIPTION_ID="Enter your Azure Subscription ID: "
set /p GEMINI_API_KEY="Enter your Gemini API Key: "
set /p GEMINI_MODERATOR_API_KEY="Enter your Gemini Moderator API Key: "
set /p HOST_PASSWORD="Enter Host Password (or press Enter for default): "

if "%HOST_PASSWORD%"=="" set HOST_PASSWORD=SecureA2MP2025!

echo.
echo Starting deployment with:
echo - Subscription: %SUBSCRIPTION_ID%
echo - Host Password: %HOST_PASSWORD%
echo.

REM Run the PowerShell deployment script
powershell -ExecutionPolicy Bypass -File "deploy-azure.ps1" -SubscriptionId "%SUBSCRIPTION_ID%" -GeminiApiKey "%GEMINI_API_KEY%" -GeminiModeratorApiKey "%GEMINI_MODERATOR_API_KEY%" -HostPassword "%HOST_PASSWORD%"

echo.
echo Deployment script completed.
pause