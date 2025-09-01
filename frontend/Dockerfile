# Stage 1: Build
FROM node:22.18.0-slim AS builder

# install build tools for sharp
RUN apt-get update && apt-get install -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install sharp --save

COPY . .
RUN npm run build

# Stage 2: Run
FROM node:22.18.0-slim
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]
