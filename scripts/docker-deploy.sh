#!/bin/bash

# ============================================================================
# DOCKER DEPLOYMENT SCRIPT
# Usage: ./scripts/docker-deploy.sh [prod|staging]
# ============================================================================

set -e

ENV=${1:-prod}
COMPOSE_FILE=""
PORT=80
SCHEMA_PATH="packages/database/prisma/schema.prisma"

if [ "$ENV" = "staging" ]; then
    echo "🚀 Deploying to STAGING environment..."
    COMPOSE_FILE="docker-compose.staging.yml"
    PORT=8080
else
    echo "🚀 Deploying to PRODUCTION environment..."
    COMPOSE_FILE="docker-compose.prod.yml"
    PORT=3000
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: Compose file $COMPOSE_FILE not found!"
    exit 1
fi

echo "🐳 Starting Docker deployment using $COMPOSE_FILE..."

# Build images
echo "🔨 Building images..."
docker-compose -f $COMPOSE_FILE build --no-cache

# Stop old containers
echo "🛑 Stopping old containers..."
docker-compose -f $COMPOSE_FILE down

# Start new containers
echo "▶️ Starting new containers..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 15

# Run migrations
echo "🔄 Running migrations..."
# Using the web container to run migrations as root to allow package installation if needed
# We mount the current directory to /app temporarily to access the source schema.
# We ensure prisma is available by using npx with a writable cache (in /tmp or similar if needed, but root usually works)
docker-compose -f $COMPOSE_FILE run --rm --user root --entrypoint /bin/sh -v $(pwd):/app -w /app web -c "npx -y prisma migrate deploy --schema=$SCHEMA_PATH"

# Check health
echo "🏥 Checking health..."
HEALTH_URL="http://localhost:$PORT/api/health"

if command -v curl &> /dev/null; then
    echo "Checking $HEALTH_URL..."
    # Retry loop for health check
    MAX_RETRIES=5
    RETRY_COUNT=0
    until curl -f -s $HEALTH_URL > /dev/null || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
        echo "Health check attempt $((RETRY_COUNT+1))..."
        sleep 5
        RETRY_COUNT=$((RETRY_COUNT+1))
    done

    if curl -f -s $HEALTH_URL > /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed after $MAX_RETRIES attempts! Check logs using: docker-compose -f $COMPOSE_FILE logs"
        exit 1
    fi
else
    echo "⚠️  curl not found, skipping health check"
fi

echo "✅ Deployment to $ENV completed successfully!"
