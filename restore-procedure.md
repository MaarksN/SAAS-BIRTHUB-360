# Disaster Recovery: Restore Procedure

## 1. Prerequisites
- `postgresql-client` (psql) installed.
- Access to backup storage (e.g., AWS S3).
- `DATABASE_URL` environment variable for the target database.
- Admin access to the environment.

## 2. Restore Steps

### Step 1: Isolate Environment
Stop the application to prevent new writes.
```bash
# Example
docker-compose stop web
# OR scale down to 0
kubectl scale deployment/web --replicas=0
```

### Step 2: Retrieve Backup
Download the latest verified backup.
```bash
# Example
aws s3 cp s3://salesos-backups/latest-backup.sql ./restore.sql
```

### Step 3: Verify Backup File
Ensure the file is valid and not empty.
```bash
ls -lh ./restore.sql
head -n 5 ./restore.sql
```

### Step 4: Reset Database
**WARNING: This destroys current data.**
```bash
npx prisma migrate reset --force
```

### Step 5: Restore Data
Restore the dump into the database.
```bash
psql "$DATABASE_URL" < ./restore.sql
```

### Step 6: Verify Integrity
Run the verification script to ensure data is readable.
```bash
npx tsx tools/verify-backup.ts
```

### Step 7: Restart Application
```bash
docker-compose start web
```

## 3. RTO (Recovery Time Objective)
- Estimated time: 15-30 minutes depending on database size.
