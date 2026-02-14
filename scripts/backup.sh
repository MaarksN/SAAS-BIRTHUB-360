#!/bin/sh
set -e

TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_DIR="/backups"
FILENAME="backup_${TIMESTAMP}.sql.gz"

echo "Starting backup at ${TIMESTAMP}..."

# Ensure backup directory exists
mkdir -p ${BACKUP_DIR}

# Dump database
pg_dump -h ${DB_HOST} -U ${DB_USER} ${DB_NAME} | gzip > ${BACKUP_DIR}/${FILENAME}

echo "Backup completed: ${FILENAME}"

# Retention Policy: Keep last 30 days (delete files older than 30 days)
find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +30 -exec rm {} \;
