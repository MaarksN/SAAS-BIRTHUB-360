# SalesOS Ultimate

Unified Sales Platform Monorepo. Built with Next.js, Prisma, FastAPI (AI Agents), and Redis.

## Project Overview
SalesOS Ultimate is an all-in-one sales acceleration platform combining CRM, Market Intelligence, and AI Agents.
- **Frontend**: Next.js 14+ (App Router), TailwindCSS, Shadcn UI.
- **Backend**: Next.js Server Actions/API Routes + Python FastAPI (AI Microservice).
- **Database**: PostgreSQL (with `pgvector` for AI embeddings).
- **Queue/Cache**: Redis (BullMQ for jobs, Cache-Aside for data).

## Architecture
The repository is a Turborepo monorepo:
- `apps/web`: The main Next.js application (dashboard, marketing, api).
- `apps/ai-agents`: Python FastAPI service for heavy AI tasks (Scraping, RAG).
- `libs/core`: Shared TypeScript library (Prisma Client, Utilities, Types).
- `infra`: Infrastructure configuration (Redis, Postgres).

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Setup Environment:
   ```bash
   cp .env.example .env
   # Update .env with your keys (OpenAI, Anthropic, Database)
   ```
3. Start Infrastructure (DB + Redis):
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
4. Database Setup:
   ```bash
   npx prisma migrate dev --schema=libs/core/src/schema.prisma
   npx prisma db seed --schema=libs/core/src/schema.prisma
   ```

### Running Development Server
To start all apps (Web + AI Agents):
```bash
npm run dev
```
- Web: http://localhost:3000
- AI API: http://localhost:8000

## Testing
- **Unit Tests**: `npm run test` (Vitest)
- **E2E Tests**: `npm run test:e2e` (Playwright in `apps/web`)

## Common Issues / FAQ
- **Prisma Client not found?** Run `npx prisma generate --schema=libs/core/src/schema.prisma`.
- **Redis Connection Error?** Ensure Docker container `salesos-redis` is running on port 6379.
- **Python Missing Dependencies?** Check `apps/ai-agents/requirements.txt` and ensure `venv` is active if running manually.

## Contribution Guidelines
1. Create a feature branch.
2. Ensure linting passes: `npm run lint`.
3. Write tests for new features.
4. Open a PR.
