#!/bin/sh

# Backup script for PostgreSQL

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
FILENAME="backup_${TIMESTAMP}.sql.gz"

echo "Starting backup at ${TIMESTAMP}..."

# Ensure backup directory exists
mkdir -p ${BACKUP_DIR}

# Perform backup
# Assuming env vars PGHOST, PGUSER, PGPASSWORD, PGDATABASE are set
pg_dump -h ${PGHOST:-db} -U ${PGUSER:-postgres} -d ${PGDATABASE:-salesos} | gzip > "${BACKUP_DIR}/${FILENAME}"

if [ $? -eq 0 ]; then
  echo "Backup successful: ${FILENAME}"
else
  echo "Backup failed!"
  exit 1
fi

# Cleanup old backups (older than 30 days)
find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +30 -delete

echo "Cleanup complete."
