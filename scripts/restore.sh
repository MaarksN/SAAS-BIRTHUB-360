#!/bin/sh
set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup_filename>"
  exit 1
fi

FILENAME=$1
BACKUP_PATH="/backups/${FILENAME}"

if [ ! -f "${BACKUP_PATH}" ]; then
  echo "Error: Backup file not found at ${BACKUP_PATH}"
  exit 1
fi

echo "Restoring from ${FILENAME}..."

# Unzip and restore
gunzip -c ${BACKUP_PATH} | psql -h ${DB_HOST} -U ${DB_USER} ${DB_NAME}

echo "Restore completed."
