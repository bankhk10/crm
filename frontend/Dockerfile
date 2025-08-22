# Stage 1: Install dependencies
# Use node:22.18.0-slim for a smaller and more stable base image
FROM node:22.18.0-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Build the application
FROM node:22.18.0-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production server
FROM node:22.18.0-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user in the final stage to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set user to non-root for security
USER nextjs

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
