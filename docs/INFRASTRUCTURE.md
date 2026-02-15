# Infrastructure & Scalability

This document outlines the infrastructure setup, scalability strategies, and operational procedures for SalesOS, designed to support scaling from 100 to 100,000 users.

## 1. Environment Isolation (Item 66)

We enforce strict separation between Staging and Production environments to prevent data corruption and ensure safe testing.

- **Production**:
  - Configuration: `docker-compose.prod.yml`
  - Database: `salesos`
  - Ports: 80 (HTTP), 443 (HTTPS)
- **Staging**:
  - Configuration: `docker-compose.staging.yml`
  - Database: `salesos_staging`
  - Ports: 8080 (HTTP), 8443 (HTTPS)
  - Volumes: `pgdata_staging`, `redisdata_staging`

**Deployment Command:**
To deploy staging:
```bash
docker-compose -p staging -f docker-compose.staging.yml up -d
```

## 2. Backup & Recovery (Items 67, 72)

Automated backups are configured for the PostgreSQL database using a sidecar service.

- **Mechanism**: A dedicated `backup` service runs `scripts/backup.sh` daily.
- **Storage**: Backups are stored in the `backups` docker volume.
- **Retention**: 30 days (older files are automatically deleted).

**Disaster Recovery Plan (DRP):**
1.  **Identify Failure**: Confirm database corruption or accidental data loss.
2.  **Locate Backup**: Identify the latest valid `.sql.gz` file in the backup volume.
3.  **Restore Procedure**:
    ```bash
    # 1. Stop the application services
    docker-compose stop web worker

    # 2. Restore database (example command, adjust paths/container names)
    # Ensure the backup file is available to the db container or pipe it in
    zcat backup_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T db psql -U postgres -d salesos

    # 3. Restart application
    docker-compose start
    ```
4.  **Verification**: Check application logs and `/api/health` endpoint to confirm stability.

## 3. Health Checks (Item 68)

Services implement deep health checks that verify connectivity to downstream dependencies (Database, Redis). These are used by the orchestrator to restart unhealthy services.

- **Web Service (Next.js)**:
  - Endpoint: `/api/health`
  - Checks: PostgreSQL (`SELECT 1`), Redis (`PING`).
  - Behavior: Returns 503 if any dependency is down.
- **AI Agents Service (FastAPI)**:
  - Endpoint: `/ready`
  - Checks: PostgreSQL, Redis.
  - Behavior: Returns 503 if dependencies are unreachable.

## 4. Scalability & Autoscaling (Item 69)

Strategies to handle load increase:

- **Web Service**: Stateless application. Scale horizontally by increasing replica count.
  - *Metric Triggers*: CPU > 70% or Memory > 80%.
- **Worker Service**: CPU-intensive (AI processing). Isolate on dedicated nodes if possible.
  - *Metric Triggers*: Queue Depth (Redis) > 100 items.

**Docker Swarm / K8s Config Example:**
```yaml
deploy:
  replicas: 3
  restart_policy:
    condition: on-failure
  resources:
    limits:
      cpus: "1.0"
      memory: "1G"
```

## 5. Logging & Monitoring (Items 70, 71)

- **Centralized Logs**: Configure a log shipper (e.g., Datadog Agent, Fluentd, Filebeat) to aggregate logs from all containers. Avoid relying on local `docker logs` in production.
- **Resource Alerts**:
  - **High Priority**: Database Disk Usage > 90%, Memory Usage > 90%.
  - **Medium Priority**: API Error Rate (5xx) > 1%, High Response Latency.

## 6. Cost Optimization (Item 73)

- **Spot Instances**: Utilize Spot Instances for stateless `worker` nodes and non-critical batch processing.
- **Reserved Instances**: Commit to Reserved Instances for the Database and Redis layer (stateful services) to reduce costs by up to 60%.
- **Resource Audits**: Periodically audit `docker stats` and remove unused resources (`docker system prune`).

## 7. Security & Isolation (Items 74, 75)

- **Service Isolation**: The AI processing logic is isolated in the `worker` container (`apps/ai-agents`), ensuring that heavy inference tasks do not degrade the performance of the `web` application.
- **Web Application Firewall (WAF)**: It is recommended to place the infrastructure behind a WAF (e.g., Cloudflare, AWS WAF) to mitigate:
  - SQL Injection / XSS
  - DDoS attacks
  - Bot traffic
