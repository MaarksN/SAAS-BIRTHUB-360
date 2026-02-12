#!/bin/bash
set -e

# JULES DEPLOYMENT SCRIPT (LINUX/BASH)
# Equivalente ao deploy.ps1 para ambientes CI/CD e Servidores Linux

echo "[JULES] Iniciando sequência de deploy..."

# 1. Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "[ERRO] Docker não encontrado. Instale o Docker Engine."
    exit 1
fi

# 2. Carregar variáveis (se necessário) ou definir vars de build
APP_NAME="birthub-360"
ENV=${1:-production} # Default para production se não passar argumento

echo "[JULES] Ambiente alvo: $ENV"

# 3. Build das Imagens
echo "[JULES] Construindo imagens..."
docker compose -f docker-compose.prod.yml build

# 4. Database Migration (Prisma)
# Executa dentro de um container efêmero para não precisar de Node no host
echo "[JULES] Executando migrações de banco..."
docker compose -f docker-compose.prod.yml run --rm web npx prisma migrate deploy

# 5. Reiniciar Serviços (Rolling Update simples)
echo "[JULES] Reiniciando serviços..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 6. Limpeza de Imagens Antigas (Prune)
echo "[JULES] Limpando imagens órfãs..."
docker image prune -f

echo "[JULES] Deploy concluído com sucesso! 🚀"
