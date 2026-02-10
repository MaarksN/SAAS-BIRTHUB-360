FROM node:20-bullseye-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    dumb-init \
    chromium \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libdrm2 \
    libgbm1 \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libnspr4 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Build only ai-agents and its dependencies
RUN npx turbo run build --filter=ai-agents

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built artifacts
# Copy libs source/dist as they are symlinked in node_modules
COPY --from=builder /app/libs ./libs
# Copy node_modules (includes symlinks)
COPY --from=builder /app/node_modules ./node_modules
# Copy built app
COPY --from=builder /app/apps/ai-agents/dist ./apps/ai-agents/dist
COPY --from=builder /app/apps/ai-agents/package.json ./apps/ai-agents/package.json

USER nextjs

# Start worker from root context pointing to the built file
CMD ["dumb-init", "node", "apps/ai-agents/dist/worker.js"]
