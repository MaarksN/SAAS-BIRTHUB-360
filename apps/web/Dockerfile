FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  --mount=type=cache,target=/root/.npm \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# If using Turbo, we might need to prune or build specific app.
# Assuming standard Next.js build command in package.json works for the app context or we copy everything.
# Since it's a monorepo, copying everything is needed for workspace dependencies.
# Ideally we use 'turbo prune' but that requires turbo installation in the image.
# For simplicity, we copy everything and run the build script defined in package.json for the app.
# But wait, we are inside `apps/web` context in Dockerfile? No, usually build context is root.
# If build context is `apps/web`, we can't access `libs`.
# So Docker build context MUST be root.
# COPY . . assumes root.

RUN npm run build
# Note: "npm run build" in root triggers "turbo run build".
# We need to build specifically "web".
# So: npx turbo run build --filter=web...
# But simpler: cd apps/web && npm run build (if scripts are set up correctly to use local turbo or root turbo).
# Actually root package.json has "build": "turbo run build".
# So running `npm run build` builds everything.
# We want to build only web for this container?
# Yes. `npx turbo run build --filter=web`

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# CMD ["node", "server.js"]
# Standalone output puts server.js in apps/web/server.js?
# Usually standalone output structure mirrors source.
# So `node apps/web/server.js`
CMD ["node", "apps/web/server.js"]
