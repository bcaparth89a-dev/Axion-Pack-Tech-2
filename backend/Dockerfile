# ==============================================================================
# AXION PackTech Backend Multi-Stage Production Dockerfile
# ==============================================================================

# 1. Base Stage
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat ffmpeg

# 2. Dependencies Stage
FROM base AS dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Build Stage
FROM base AS builder
COPY package.json package-lock.json* ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build
RUN npm prune --production

# 4. Production Runner Stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=5000

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 axionapp

# Pre-create uploads directory with correct permissions for non-root user
RUN mkdir -p /app/uploads/resumes && \
    chown -R axionapp:nodejs /app/uploads

# Copy built application and production dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER axionapp

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "dist/server.js"]
