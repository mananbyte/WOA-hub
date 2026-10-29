# Multi-stage Dockerfile for WoA Contract Hub (SkyLink WoA)
# Stage 1: Build Frontend (Vite + React)
FROM node:22-alpine AS web-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Stage 2: Build Backend (TypeScript + Express)
FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Stage 3: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend
COPY --from=backend-builder /app/dist ./dist

# Copy compiled frontend
COPY --from=web-builder /app/web/dist ./web/dist

# Copy migrations and schema
COPY drizzle/ ./drizzle/
COPY drizzle.config.ts ./

EXPOSE 3000

# Start command: push schema changes and launch server
CMD ["node", "dist/server.js"]
