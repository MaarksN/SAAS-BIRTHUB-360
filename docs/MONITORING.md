# Monitoring Configuration

## Uptime Monitoring

We recommend using **UptimeRobot** or **BetterStack** for external monitoring.

### Setup Instructions

1.  Create an account on [UptimeRobot](https://uptimerobot.com/) or [BetterStack](https://betterstack.com/).
2.  Add a new monitor:
    *   **Monitor Type:** HTTP(s)
    *   **Friendly Name:** SalesOS Production
    *   **URL:** `https://api.salesos.io/api/health` (or your production URL)
    *   **Monitoring Interval:** 1 minute
3.  Configure Alert Contacts:
    *   Add Email, SMS, or Slack integration.
4.  (Optional) Add a monitor for the AI Agents service if exposed directly.

## Internal Health Checks

The application provides health check endpoints:
*   Web App: `/api/health`
*   AI Agents: `/health`

These are checked automatically during deployment and by the `scripts/health-check.sh` script.

## CI/CD Notifications

The CI pipeline is configured to notify on build failures. To enable Slack notifications:
1.  Create a Slack App and incoming webhook.
2.  Add `SLACK_WEBHOOK` secret to GitHub Repository Secrets.
3.  Uncomment the notification step in `.github/workflows/ci.yml`.
