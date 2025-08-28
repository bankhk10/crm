# --- builder ---
FROM node:22.18.0-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
# ถ้ามี build seed: RUN npm run build:seed

# --- runner ---
FROM node:22.18.0-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3001
# ถ้า main ของคุณคือ dist/src/main.js ให้แก้เป็น node dist/src/main.js
CMD ["sh","-c","npx prisma migrate deploy && node dist/main.js"]
