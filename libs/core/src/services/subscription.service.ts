import { prisma } from '../prisma';
import { cacheService } from './cache-service';
import { SubscriptionPlan, Prisma } from '@prisma/client';

export class SubscriptionService {
  private readonly CACHE_KEY = 'subscription:plans:all';
  private readonly CACHE_TTL = 3600 * 24; // 24 hours

  /**
   * Fetches all active subscription plans.
   * Uses Redis caching to minimize DB load for this static data.
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const plans = await cacheService.getOrSet<any[]>(
      this.CACHE_KEY,
      async () => {
        return prisma.subscriptionPlan.findMany({
          where: { isActive: true },
          orderBy: { priceMonthly: 'asc' }
        });
      },
      this.CACHE_TTL
    );

    // Hydrate Dates and Decimals after JSON deserialization
    return plans.map((plan: any) => ({
      ...plan,
      createdAt: new Date(plan.createdAt),
      updatedAt: new Date(plan.updatedAt),
      deletedAt: plan.deletedAt ? new Date(plan.deletedAt) : null,
      priceMonthly: new Prisma.Decimal(plan.priceMonthly),
      priceYearly: new Prisma.Decimal(plan.priceYearly)
    })) as SubscriptionPlan[];
  }

  /**
   * Gets a specific plan by ID from the cached list.
   * @param id Plan ID
   */
  async getPlanById(id: string): Promise<SubscriptionPlan | null> {
    const plans = await this.getPlans();
    return plans.find(p => p.id === id) || null;
  }

  /**
   * Invalidates the plans cache.
   * Call this when a plan is created/updated/deleted.
   */
  async invalidateCache(): Promise<void> {
    await cacheService.del(this.CACHE_KEY);
  }
}

export const subscriptionService = new SubscriptionService();
