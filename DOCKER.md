# 🐳 Docker Deployment Guide for A²MP

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Environment Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd Asynchronous-AI-Meeting-Platform

# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
# At minimum, set:
# GEMINI_API_KEY=your_actual_api_key_here
# GEMINI_MODERATOR_API_KEY=your_actual_api_key_here
```

### 2. Production Deployment
```bash
# Build and start the application
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
```

### 3. Development Mode
```bash
# Run in development mode with hot reload
docker-compose -f docker-compose.dev.yml up

# Or with logs
docker-compose -f docker-compose.dev.yml up --build
```

## 📱 Application Access

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web interface |
| **Backend API** | http://localhost:4000 | REST API endpoints |
| **Health Check** | http://localhost:4000/api/health | Service status |
| **Host Dashboard** | http://localhost:3000/host | Meeting management (login: 12345) |

## 🔧 Configuration

### Environment Variables

#### Required
- `GEMINI_API_KEY` - Your Google Gemini API key
- `GEMINI_MODERATOR_API_KEY` - API key for moderator AI (can be same as above)

#### Optional
- `HOST_PASSWORD` - Host authentication password (default: 12345)
- `MAX_TURNS_PER_MEETING` - Maximum conversation turns (default: 25)
- `ENGINE_TICK_MS` - Engine processing interval (default: 8000ms)
- `CORS_ORIGIN` - Allowed frontend origins (default: http://localhost:3000)

### Customizing Ports
```yaml
# In docker-compose.yml, change:
ports:
  - "8080:3000"  # Frontend on port 8080
  - "8081:4000"  # Backend on port 8081
```

## 💾 Data Persistence

### Database Storage
SQLite databases are stored in Docker volumes:
- `a2mp_data` - Main database volume
- `a2mp_data_backend` - Backup database location

### Backup Database
```bash
# Create backup
docker run --rm -v a2mp_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/a2mp-backup-$(date +%Y%m%d).tar.gz /data

# Restore backup
docker run --rm -v a2mp_data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/a2mp-backup-YYYYMMDD.tar.gz -C /
```

## 🛠️ Development

### Hot Reload Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Rebuild after package.json changes
docker-compose -f docker-compose.dev.yml up --build
```

### Accessing Container
```bash
# Shell into running container
docker exec -it a2mp-app sh

# Run debugging scripts
docker exec -it a2mp-app node check-db.js
docker exec -it a2mp-app node list-meetings.js
```

### Development vs Production

| Feature | Development | Production |
|---------|------------|-------------|
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **Source Maps** | ✅ Enabled | ❌ Disabled |
| **Optimization** | ❌ Minimal | ✅ Full |
| **File Watching** | ✅ Volume mounted | ❌ Baked in |
| **Engine Tick** | 15s (slower) | 8s (faster) |

## 📊 Monitoring & Debugging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f a2mp

# Last 100 lines
docker-compose logs --tail=100 a2mp
```

### Health Monitoring
```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:4000/api/health
curl http://localhost:3000
```

### Debugging Commands
```bash
# Check database
docker exec -it a2mp-app node check-db.js

# List recent meetings
docker exec -it a2mp-app node list-meetings.js

# Check last meeting details
docker exec -it a2mp-app node scripts/check-last-meeting.js

# View meeting timeline
docker exec -it a2mp-app node scripts/check-meeting-timeline.js
```

## 🚀 Deployment Options

### Single Container Deployment
```bash
# Build image
docker build -t a2mp .

# Run with custom settings
docker run -d \
  --name a2mp-app \
  -p 3000:3000 -p 4000:4000 \
  -e GEMINI_API_KEY=your_key_here \
  -e HOST_PASSWORD=your_password \
  -v a2mp_data:/app/backend/data \
  a2mp
```

### Production with Reverse Proxy
```nginx
# nginx.conf example
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Multi-Platform Builds
```bash
# Build for multiple architectures
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t a2mp .

# Build for specific platform
docker build --platform linux/amd64 -t a2mp .
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :3000
netstat -tulpn | grep :4000

# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Use different host port
```

#### API Key Issues
```bash
# Verify environment variables
docker exec -it a2mp-app env | grep GEMINI

# Test API key
docker exec -it a2mp-app node check-quota.js
```

#### Database Permission Issues
```bash
# Check data directory permissions
docker exec -it a2mp-app ls -la /app/backend/data

# Reset permissions if needed
docker exec -it --user root a2mp-app chown -R a2mp:nodejs /app/backend/data
```

#### Container Won't Start
```bash
# Check logs for errors
docker-compose logs a2mp

# Remove containers and rebuild
docker-compose down
docker-compose up --build
```

### Performance Tuning
```yaml
# In docker-compose.yml
environment:
  - ENGINE_TICK_MS=5000      # Faster processing
  - MAX_TURNS_PER_MEETING=30 # Longer conversations
```

## 🔒 Security Considerations

- Change `HOST_PASSWORD` from default (12345)
- Use strong `JWT_SECRET` in production
- Restrict `CORS_ORIGIN` to your domain
- Keep Gemini API keys secure
- Run behind HTTPS in production
- Consider using Docker secrets for sensitive data

## 📋 Maintenance

### Regular Tasks
```bash
# Update containers
docker-compose pull
docker-compose up -d

# Clean up unused resources
docker system prune -f

# View resource usage
docker stats a2mp-app
```

### Updating the Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```