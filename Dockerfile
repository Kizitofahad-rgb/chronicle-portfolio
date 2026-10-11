# Multi-stage production build for Cloud Run
# Stage 1: Build the frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root manifests and configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY .npmrc ./

# Copy frontend source files
COPY artifacts/chronicle-portfolio/package.json ./artifacts/chronicle-portfolio/
COPY artifacts/chronicle-portfolio/tsconfig.json ./artifacts/chronicle-portfolio/
COPY artifacts/chronicle-portfolio/vite.config.ts ./artifacts/chronicle-portfolio/
COPY artifacts/chronicle-portfolio/index.html ./artifacts/chronicle-portfolio/
COPY artifacts/chronicle-portfolio/src ./artifacts/chronicle-portfolio/src
COPY artifacts/chronicle-portfolio/public ./artifacts/chronicle-portfolio/public

# Install dependencies and compile
RUN npm install
RUN npm run build --workspace=@workspace/chronicle-portfolio

# Stage 2: Minimal production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
COPY server.js ./
COPY server.mjs ./
COPY server.ts ./

# Copy built distribution from builder
COPY --from=builder /app/dist ./dist

# Synchronize public assets
COPY --from=builder /app/artifacts/chronicle-portfolio/public/assets ./dist/assets

EXPOSE 8080

CMD ["node", "server.js"]
