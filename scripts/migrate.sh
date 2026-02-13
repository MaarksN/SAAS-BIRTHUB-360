#!/bin/bash

# ============================================================================
# DATABASE MIGRATION SCRIPT
# ============================================================================

set -e

echo "🗄️  Running database migrations..."

# Load .env if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Verificar se DATABASE_URL está setada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
    exit 1
fi

# Backup (produção)
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Creating backup..."
    if [ ! -d backups ]; then mkdir backups; fi
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    if command -v pg_dump &> /dev/null; then
        pg_dump $DATABASE_URL > "backups/db_backup_$TIMESTAMP.sql"
        echo "✅ Backup created: db_backup_$TIMESTAMP.sql"
    else
        echo "⚠️  pg_dump not found, skipping backup"
    fi
fi

# Rodar migrations
npx prisma migrate deploy --schema=libs/core/src/schema.prisma

# Gerar client
npx prisma generate --schema=libs/core/src/schema.prisma

echo "✅ Migrations completed"
