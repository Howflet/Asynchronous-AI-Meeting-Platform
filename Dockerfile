# Multi-stage build for A²MP (Asynchronous AI Meeting Platform)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy root package files (if any)
COPY package*.json ./

# Copy backend package files
COPY backend/package*.json ./backend/

# Copy frontend package files  
COPY nextjs-frontend/package*.json ./nextjs-frontend/

# Install all dependencies (including dev dependencies for building)
RUN if [ -f package.json ]; then npm ci && npm cache clean --force; fi
RUN cd backend && npm ci && npm cache clean --force
RUN cd nextjs-frontend && npm ci --legacy-peer-deps && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/nextjs-frontend/node_modules ./nextjs-frontend/node_modules

# Copy source code
COPY . .

# Build the backend (TypeScript compilation)
WORKDIR /app/backend
RUN npm run build

# Build the Next.js frontend
WORKDIR /app/nextjs-frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production dependencies stage
FROM base AS prod-deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY nextjs-frontend/package*.json ./nextjs-frontend/

# Install only production dependencies
RUN if [ -f package.json ]; then npm ci --only=production && npm cache clean --force; fi
RUN cd backend && npm ci --only=production && npm cache clean --force
RUN cd nextjs-frontend && npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Production runtime stage
FROM base AS runner
WORKDIR /app

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 a2mp

# Copy built backend
COPY --from=builder --chown=a2mp:nodejs /app/backend/dist ./backend/dist
COPY --from=prod-deps --chown=a2mp:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=a2mp:nodejs /app/backend/package*.json ./backend/

# Copy built frontend  
COPY --from=builder --chown=a2mp:nodejs /app/nextjs-frontend/.next/standalone ./
COPY --from=builder --chown=a2mp:nodejs /app/nextjs-frontend/.next/static ./nextjs-frontend/.next/static
COPY --from=builder --chown=a2mp:nodejs /app/nextjs-frontend/public ./nextjs-frontend/public
COPY --from=builder --chown=a2mp:nodejs /app/nextjs-frontend/server.js ./nextjs-frontend/
COPY --from=prod-deps --chown=a2mp:nodejs /app/nextjs-frontend/node_modules ./nextjs-frontend/node_modules

# Copy utility scripts
COPY --chown=a2mp:nodejs check-*.js ./
COPY --chown=a2mp:nodejs list-meetings.js ./
COPY --chown=a2mp:nodejs create-test-meeting.js ./
COPY --chown=a2mp:nodejs scripts/ ./scripts/

# Create data directories
RUN mkdir -p /app/backend/data /app/backend/backend/data && \
    chown -R a2mp:nodejs /app/backend/data /app/backend/backend/data

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV BACKEND_PORT=4000

USER a2mp

EXPOSE 3000 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start both services
CMD ["sh", "-c", "cd /app/backend && PORT=4000 node dist/server.js & cd /app/nextjs-frontend && PORT=3000 node server.js & wait"]