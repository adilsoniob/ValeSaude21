FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY . .

FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends chromium && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app .
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
EXPOSE 4320
CMD node src/index.js