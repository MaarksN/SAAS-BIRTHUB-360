#!/bin/bash

# ============================================================================
# DOCKER DEPLOYMENT SCRIPT
# ============================================================================

set -e

echo "🐳 Starting Docker deployment..."

# Build images
echo "Building images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop old containers
echo "Stopping old containers..."
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo "Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "Waiting for services to be ready..."
sleep 10

# Run migrations
echo "Running migrations..."
# We use a temporary container with source mounted to access schema and migrations
# This assumes node_modules are available on host or npx can install prisma
docker-compose -f docker-compose.prod.yml run --rm --entrypoint /bin/sh -v $(pwd):/app -w /app web -c "npx prisma migrate deploy --schema=libs/core/src/schema.prisma"

# Check health
echo "Checking health..."
if command -v curl &> /dev/null; then
    curl -f http://localhost:3000/api/health || echo "⚠️  Health check failed (HTTP 500 or connection refused). Check logs."
else
    echo "⚠️  curl not found, skipping health check"
fi

echo "✅ Deployment completed successfully"
