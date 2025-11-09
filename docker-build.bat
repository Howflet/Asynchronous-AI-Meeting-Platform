@echo off
REM A2MP Docker Build and Deployment Script for Windows
setlocal enabledelayedexpansion

REM Colors (Windows doesn't support colors in batch easily, so we'll use simple text)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo %WARNING% .env file not found. Creating from template...
    copy .env.example .env
    echo %WARNING% Please edit .env file and add your Gemini API key before continuing.
    echo %WARNING% At minimum, set GEMINI_API_KEY and GEMINI_MODERATOR_API_KEY
    pause
    exit /b 1
)

REM Check for required environment variables
findstr /C:"GEMINI_API_KEY=" .env | findstr /V /C:"GEMINI_API_KEY=$" | findstr /V /C:"GEMINI_API_KEY=your_" >nul
if errorlevel 1 (
    echo %ERROR% GEMINI_API_KEY not properly set in .env file. Please add your API key.
    pause
    exit /b 1
)

goto :%1 2>nul || goto :help

:prod
:production
echo %INFO% Building and starting A2MP in production mode...

REM Stop any running containers
docker-compose down 2>nul

REM Build and start
docker-compose up --build -d

REM Wait for services to start
echo %INFO% Waiting for services to start...
timeout /t 10 >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if not errorlevel 1 (
    echo %SUCCESS% A2MP is now running!
    echo.
    echo 🌐 Access your application:
    echo    Frontend: http://localhost:3000
    echo    Backend:  http://localhost:4000
    echo    Health:   http://localhost:4000/api/health
    echo.
    echo 📱 Host Dashboard: http://localhost:3000/host
    
    REM Extract password from .env
    for /f "tokens=2 delims==" %%a in ('findstr "HOST_PASSWORD" .env') do set "host_pass=%%a"
    echo    Default password: !host_pass!
    echo.
    echo 📋 Management commands:
    echo    docker-compose logs -f    # View logs
    echo    docker-compose ps         # Check status
    echo    docker-compose down       # Stop services
) else (
    echo %ERROR% Failed to start services. Check logs with: docker-compose logs
    pause
)
goto :end

:dev
:development
echo %INFO% Starting A2MP in development mode...

REM Stop any running containers
docker-compose -f docker-compose.dev.yml down 2>nul

REM Start development environment
docker-compose -f docker-compose.dev.yml up --build
goto :end

:stop
echo %INFO% Stopping A2MP services...
docker-compose down
docker-compose -f docker-compose.dev.yml down 2>nul
echo %SUCCESS% Services stopped.
goto :end

:status
echo %INFO% A2MP Service Status:
echo.

docker-compose ps | findstr "Up" >nul
if not errorlevel 1 (
    echo %SUCCESS% Production services are running
    docker-compose ps
) else (
    echo %WARNING% Production services are not running
)

echo.

docker-compose -f docker-compose.dev.yml ps 2>nul | findstr "Up" >nul
if not errorlevel 1 (
    echo %SUCCESS% Development services are running
    docker-compose -f docker-compose.dev.yml ps
) else (
    echo %WARNING% Development services are not running
)
goto :end

:logs
docker-compose ps | findstr "Up" >nul
if not errorlevel 1 (
    echo %INFO% Showing production logs (Ctrl+C to exit)...
    docker-compose logs -f
) else (
    docker-compose -f docker-compose.dev.yml ps 2>nul | findstr "Up" >nul
    if not errorlevel 1 (
        echo %INFO% Showing development logs (Ctrl+C to exit)...
        docker-compose -f docker-compose.dev.yml logs -f
    ) else (
        echo %WARNING% No services are currently running.
    )
)
goto :end

:cleanup
echo %INFO% Cleaning up Docker resources...
docker-compose down
docker-compose -f docker-compose.dev.yml down 2>nul
docker system prune -f
echo %SUCCESS% Cleanup completed.
goto :end

:help
echo A2MP Docker Management Script
echo.
echo Usage: %~nx0 [command]
echo.
echo Commands:
echo   prod, production  - Build and start in production mode
echo   dev, development  - Start in development mode with hot reload
echo   stop              - Stop all services
echo   status            - Show service status
echo   logs              - Show service logs
echo   cleanup           - Clean up Docker resources
echo   help              - Show this help message
echo.
echo Examples:
echo   %~nx0 prod           # Start production environment
echo   %~nx0 dev            # Start development environment
echo   %~nx0 logs           # View logs
echo   %~nx0 stop           # Stop all services
echo.
pause

:end