# SalesOS Ultimate (Monorepo)

This repository follows a monorepo structure using TurboRepo.

## Structure

- **apps/**
  - **web**: Next.js Application (Frontend & API Routes)
  - **ai-agents**: Python AI Workers (FastAPI/Uvicorn)
- **libs/**
  - **core**: Shared utilities, types, Zod schemas, error handling.
- **infra/**
  - **docker**: Dockerfiles and Docker Compose configurations.
- **scripts/**: Automation scripts.
- **docs/**: Documentation and roadmaps.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.11+)
- Docker & Docker Compose

### Development

To start the development environment:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Infrastructure (Postgres & AI Agents)**:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Start Web App**:
   ```bash
   cd apps/web
   npm run dev
   ```
   (Or from root if configured: `npm run dev --filter=web`)

## Project Structure Details

- **apps/web**: Contains the main SaaS application.
  - `app/`: App Router pages/layouts.
  - `pages/`: Pages Router pages (Legacy/Migration).
  - `components/`: React components.
  - `services/`: Business logic services.
  - `lib/`: Shared utilities specific to web.
  - `hooks/`: React hooks.
  - `styles/`: Global styles.

- **apps/ai-agents**: Contains Python workers for heavy lifting.

- **libs/core**: Shared TypeScript code used across apps (if applicable).
