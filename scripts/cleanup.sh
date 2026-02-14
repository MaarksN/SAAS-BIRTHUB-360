#!/bin/bash

# ============================================================================
# CLEANUP SCRIPT
# ============================================================================

echo "🧹 Cleaning up..."

# Remove node_modules
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# Remove build artifacts
find . -name '.next' -type d -prune -exec rm -rf '{}' +
find . -name 'dist' -type d -prune -exec rm -rf '{}' +
find . -name '.turbo' -type d -prune -exec rm -rf '{}' +

# Remove Python cache
find . -name '__pycache__' -type d -prune -exec rm -rf '{}' +
find . -name '*.pyc' -delete

# Remove logs
rm -rf logs/*.log

echo "✅ Cleanup completed"
