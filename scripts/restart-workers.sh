#!/bin/bash

# ============================================================================
# RESTART WORKERS SCRIPT
# ============================================================================

echo "🔄 Restarting workers..."

# Stop all workers
pkill -f "email-scheduler"
pkill -f "email-worker"
pkill -f "audit-worker"
pkill -f "hubspot-sync"

echo "Stopped all workers"

# Wait
sleep 2

# Start workers
npm run scheduler:email --workspace=libs/queue-core &
npm run worker:email --workspace=libs/queue-core &
npm run worker:audit --workspace=libs/queue-core &

echo "✅ Workers restarted"
