import { prisma } from '../prisma';
import { logger } from '../logger';
import { redis } from '../redis';

export const alerts = {
  /**
   * Checks usage against plan limits and sends alerts if thresholds are crossed.
   * Designed to be run periodically (e.g., hourly job) or after significant usage events.
   */
  checkAndAlert: async (organizationId: string) => {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: { plan: true },
      });

      if (!org || !org.plan || !org.plan.limits) return;

      const limits = org.plan.limits as { ai_tokens?: number };
      const tokenLimit = limits.ai_tokens || 0;

      if (tokenLimit === 0) return;

      // Calculate current month usage
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const usageAgg = await prisma.usageLog.aggregate({
        where: {
          organizationId,
          createdAt: { gte: startOfMonth },
        },
        _sum: {
          inputTokens: true,
          outputTokens: true,
        },
      });

      const totalTokens = (usageAgg._sum.inputTokens || 0) + (usageAgg._sum.outputTokens || 0);
      const usagePercent = (totalTokens / tokenLimit) * 100;

      const thresholds = [50, 80, 95];
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

      for (const threshold of thresholds) {
        if (usagePercent >= threshold) {
          const alertKey = `alert:${organizationId}:${monthKey}:${threshold}`;
          const alreadyAlerted = await redis.get(alertKey);

          if (!alreadyAlerted) {
            // Simulate sending email
            logger.warn(`ALERT: Organization ${organizationId} has consumed ${usagePercent.toFixed(1)}% of their AI budget.`);

            // In real impl: await emailService.sendUsageAlert(...)

            // Mark as alerted for this month
            await redis.setex(alertKey, 60 * 60 * 24 * 32, 'true');
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to check alerts for org ${organizationId}`, error);
    }
  },
};
