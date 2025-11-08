#############################################
# Backend multi-stage Dockerfile
# - Install dependencies in a separate stage
# - Copy only necessary files for production
# - Run as non-root user
#############################################

FROM node:18-alpine AS deps
WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

FROM node:18-alpine AS runner
WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy app source
COPY . .

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

# Healthcheck (optional) - lightweight TCP check using nc if available
# Note: nc isn't in alpine by default; keep simple CMD and rely on orchestration healthchecks
CMD ["node", "server.js"]
