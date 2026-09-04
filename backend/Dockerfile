# =============================================
# Stage 1 — Dependencies
# =============================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# =============================================
# Stage 2 — Runtime
# =============================================
FROM node:22-alpine AS runtime

# Add non-root user for security
RUN addgroup -S booksteam && adduser -S booksteam -G booksteam

WORKDIR /app

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Remove .env from image (injected via docker-compose / secrets)
RUN rm -f .env

# Change ownership to non-root user
RUN chown -R booksteam:booksteam /app
USER booksteam

# Railway injects $PORT dynamically — do NOT hardcode EXPOSE or HEALTHCHECK to a static port.
# The app reads process.env.PORT in server.js, so Railway's healthcheck will work automatically.

CMD ["node", "src/server.js"]
