#!/bin/bash

# ============================================================================
# HEALTH CHECK SCRIPT
# ============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🏥 Running health checks..."

# Web App
if curl -f http://localhost:3000/api/health &> /dev/null; then
    echo -e "${GREEN}✅ Web App${NC}"
else
    echo -e "${RED}❌ Web App${NC}"
fi

# AI Agents
if curl -f http://localhost:8000/health &> /dev/null; then
    echo -e "${GREEN}✅ AI Agents${NC}"
else
    echo -e "${RED}❌ AI Agents${NC}"
fi

# Redis
if command -v redis-cli &> /dev/null; then
  if redis-cli ping &> /dev/null; then
      echo -e "${GREEN}✅ Redis${NC}"
  else
      echo -e "${RED}❌ Redis${NC}"
  fi
else
    echo -e "${RED}❌ Redis (redis-cli not found)${NC}"
fi

# PostgreSQL
if command -v pg_isready &> /dev/null; then
  if pg_isready -h localhost -p 5432 &> /dev/null; then
      echo -e "${GREEN}✅ PostgreSQL${NC}"
  else
      echo -e "${RED}❌ PostgreSQL${NC}"
  fi
else
    echo -e "${RED}❌ PostgreSQL (pg_isready not found)${NC}"
fi

echo ""
echo "Done."
