import { prisma } from '../prisma';
import { Deal } from '@birthhub/database';
import { getOrganizationId } from '../context';

export interface DealWithScore extends Deal {
  healthScore: number;
  healthStatus: 'good' | 'average' | 'poor';
  company?: { name: string } | null;
}

export class DealService {
  /**
   * Fetches deals for the current organization with health score.
   */
  static async getDeals(organizationId?: string): Promise<DealWithScore[]> {
    const orgId = organizationId || getOrganizationId();

    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    // Fetch all deals for the organization
    // Since Deal doesn't have organizationId directly, we filter by owner.organizationId
    // But wait, RLS middleware might already filter by organizationId if enabled for Deal.
    // The prompt's memory mentions RLS middleware for 'Deal'.
    // So `prisma.deal.findMany()` might be enough if context is set.
    // However, for safety and explicit filtering:

    const deals = await prisma.deal.findMany({
      where: {
        owner: {
          organizationId: orgId,
        },
      },
      include: {
        company: true,
        owner: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (deals.length === 0) {
      return [];
    }

    // Calculate average value for the organization
    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const avgValue = totalValue / deals.length;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    return deals.map((deal) => {
      let score = 0;

      // Rule 1: Interaction in last 24h (+20 pts)
      // Using updatedAt as proxy for interaction
      if (deal.updatedAt >= oneDayAgo) {
        score += 20;
      }

      // Rule 2: Value above average (+10 pts)
      if ((deal.value || 0) > avgValue) {
        score += 10;
      }

      // Rule 3: No interaction for 3 days (-30 pts)
      if (deal.updatedAt < threeDaysAgo) {
        score -= 30;
      }

      // Determine status based on score
      // This is arbitrary but let's say:
      // > 10: Good
      // > -10: Average
      // <= -10: Poor
      let healthStatus: 'good' | 'average' | 'poor' = 'average';
      if (score >= 10) {
        healthStatus = 'good';
      } else if (score <= -10) {
        healthStatus = 'poor';
      }

      return {
        ...deal,
        healthScore: score,
        healthStatus,
      };
    });
  }

  /**
   * Updates a deal's stage.
   */
  static async updateDealStage(
    dealId: string,
    stage: string,
    organizationId?: string
  ): Promise<Deal> {
    const orgId = organizationId || getOrganizationId();

    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    // Verify ownership/permission
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { owner: true },
    });

    if (!deal) {
      throw new Error('Deal not found');
    }

    if (deal.owner.organizationId !== orgId) {
      throw new Error('Unauthorized access to deal');
    }

    // Update stage
    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        stage,
        updatedAt: new Date(), // Explicitly update timestamp for interaction tracking
      },
    });

    // TODO: Log to AuditLog if needed

    return updatedDeal;
  }
}
