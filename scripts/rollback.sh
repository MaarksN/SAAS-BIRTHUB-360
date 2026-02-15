#!/bin/bash

# ============================================================================
# ROLLBACK SCRIPT
# ============================================================================

set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/rollback.sh <version_tag>"
    echo "Example: ./scripts/rollback.sh v1.2.3"
    exit 1
fi

VERSION=$1
echo "⏪ Rolling back to version: $VERSION"

# Set default image names if not provided
export DOCKER_IMAGE_WEB=${DOCKER_IMAGE_WEB:-salesos-web}
export DOCKER_IMAGE_WORKER=${DOCKER_IMAGE_WORKER:-salesos-ai-agents}

echo "Pulling images for version $VERSION..."
docker pull "$DOCKER_IMAGE_WEB:$VERSION"
docker pull "$DOCKER_IMAGE_WORKER:$VERSION"

echo "Retagging as production..."
docker tag "$DOCKER_IMAGE_WEB:$VERSION" "$DOCKER_IMAGE_WEB:production"
docker tag "$DOCKER_IMAGE_WORKER:$VERSION" "$DOCKER_IMAGE_WORKER:production"

echo "Restarting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Rollback completed. Running health checks..."
./scripts/health-check.sh
