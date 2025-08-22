# Stage 1: Build stage
FROM node:22.18.0-slim AS builder

RUN apt-get update && apt-get install -y openssl

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
# Build the main application
RUN npm run build
# Build the seed script
RUN npm run build:seed

# Stage 2: Production stage
FROM node:22.18.0-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production

# Copy built application AND the compiled seed script from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001

# Corrected command to run the application and the compiled seed script
# The final command "node dist/src/main" will now run and keep the container alive.
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node dist/src/main"]
