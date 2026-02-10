FROM node:20-bullseye-slim AS base

WORKDIR /app

# Install dependencies based on the preferred package manager
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

# Build libs first
RUN npx turbo run build --filter=@salesos/queue-core...
# Build dashboard
RUN npx turbo run build --filter=queue-dashboard

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built artifacts
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/queue-dashboard/dist ./apps/queue-dashboard/dist
COPY --from=builder /app/apps/queue-dashboard/package.json ./apps/queue-dashboard/package.json

USER nextjs

EXPOSE 3001

CMD ["node", "apps/queue-dashboard/dist/index.js"]
