FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspaces
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install all dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generate Prisma Client and build
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/api/health || exit 1

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
