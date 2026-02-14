#!/bin/bash

# ============================================================================
# SETUP SCRIPT - SAAS-BIRTHUB-360
# ============================================================================

set -e

echo "🚀 Starting SalesOS setup..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# 1. Verificar Node.js e npm
# ============================================================================
echo ""
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js 20+ required. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# ============================================================================
# 2. Verificar Docker
# ============================================================================
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Install for full functionality.${NC}"
else
    echo -e "${GREEN}✅ Docker $(docker -v | cut -d' ' -f3 | cut -d',' -f1)${NC}"
fi

# ============================================================================
# 3. Instalar dependências
# ============================================================================
echo ""
echo "📦 Installing dependencies..."

npm install

# ============================================================================
# 4. Configurar .env
# ============================================================================
echo ""
echo "⚙️  Setting up environment..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your API keys${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists, skipping${NC}"
fi

# ============================================================================
# 5. Configurar banco de dados
# ============================================================================
echo ""
echo "🗄️  Setting up database..."

# Verificar se PostgreSQL está rodando
if docker ps | grep -q postgres; then
    echo -e "${GREEN}✅ PostgreSQL container running${NC}"
else
    echo "Starting PostgreSQL and Redis via Docker Compose (Dev)..."
    docker-compose -f docker-compose.dev.yml up -d postgres redis
    sleep 5
fi

# Rodar migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=libs/core/src/schema.prisma

# Gerar Prisma Client
echo "Generating Prisma Client..."
npx prisma generate --schema=libs/core/src/schema.prisma

# Seed (opcional)
read -p "Do you want to seed the database with test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:seed
fi

# ============================================================================
# 6. Build inicial
# ============================================================================
echo ""
echo "🔨 Building project..."

npm run build

# ============================================================================
# 7. Verificar Python (para AI agents)
# ============================================================================
echo ""
echo "🐍 Checking Python setup..."

if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python3 not found. AI agents won't work.${NC}"
else
    echo -e "${GREEN}✅ Python $(python3 --version)${NC}"

    # Instalar dependências Python
    cd apps/ai-agents
    pip3 install --break-system-packages -r requirements.txt || pip3 install -r requirements.txt
    cd ../..
fi

# ============================================================================
# SUCESSO
# ============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run: npm run dev (Next.js)"
echo "3. Run: npm run ai:dev (AI Agents - Python)"
echo "4. Run: npm run workers (Background workers)"
echo ""
