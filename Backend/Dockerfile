#############################################
# Backend Multi-Stage Dockerfile (clean)
#############################################

FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create non-root user
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

# Create uploads dir (must match docker compose volume)
RUN mkdir -p /app/uploads \
    && chown -R appuser:appgroup /app/uploads \
    && chmod -R 775 /app/uploads

USER appuser

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
