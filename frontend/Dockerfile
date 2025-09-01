# ---- Stage 1: Build ----
FROM node:22.18.0-slim AS builder

# install build tools for sharp
RUN apt-get update && apt-get install -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# รับค่า ENV ตอน build (ส่งจาก docker-compose)
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install sharp --save

COPY . .

# build แบบ standalone
RUN npm run build

# ---- Stage 2: Run ----
FROM node:22.18.0-slim
WORKDIR /app

# เผื่อโค้ดบางส่วนอ่าน runtime
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NODE_ENV=production

# copy เฉพาะ output ที่จำเป็น
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
