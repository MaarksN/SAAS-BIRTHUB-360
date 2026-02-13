import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

// Helper to generate random code
function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class ReferralService {
  static async generateReferralCode(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (user?.referralCode) {
      return user.referralCode;
    }

    let code = generateCode();
    let unique = false;
    // Retry up to 5 times
    let attempts = 0;
    while (!unique && attempts < 5) {
      const existing = await prisma.user.findUnique({
        where: { referralCode: code },
      });
      if (!existing) {
        unique = true;
      } else {
        code = generateCode();
        attempts++;
      }
    }

    if (!unique) throw new Error('Failed to generate unique referral code');

    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: code },
    });

    return code;
  }

  static async createReferral(referrerId: string, refereeEmail: string) {
    // Check if referral already exists
    const existing = await prisma.referral.findFirst({
        where: { referrerId, refereeEmail }
    });

    if (existing) return existing;

    const referralCode = await this.generateReferralCode(referrerId);

    return prisma.referral.create({
      data: {
        code: referralCode,
        referrerId,
        refereeEmail,
        status: 'PENDING',
      },
    });
  }

  static async validateCode(code: string): Promise<boolean> {
      const user = await prisma.user.findUnique({ where: { referralCode: code } });
      return !!user;
  }

  static async completeReferral(code: string, newUserId: string) {
    const newUser = await prisma.user.findUnique({
        where: { id: newUserId },
        include: { organization: true }
    });
    if (!newUser) throw new Error('New user not found');

    // 1. Try to find specific pending referral by email (if invite was sent)
    let referral = await prisma.referral.findFirst({
      where: { refereeEmail: newUser.email, status: 'PENDING' },
      include: { referrer: { include: { organization: true } } },
    });

    // 2. If not found, look for referrer by code
    if (!referral) {
        const referrer = await prisma.user.findUnique({
            where: { referralCode: code },
            include: { organization: true }
        });

        if (!referrer) {
             throw new Error('Invalid referral code');
        }

        // Create the referral record on the fly
        referral = await prisma.referral.create({
            data: {
                code,
                referrerId: referrer.id,
                refereeEmail: newUser.email,
                status: 'PENDING',
            },
            include: { referrer: { include: { organization: true } } }
        });
    }

    // Don't allow self-referral
    if (referral.referrerId === newUserId) {
        throw new Error('Cannot refer yourself');
    }

    // Transaction to update referral and credit both orgs
    await prisma.$transaction(async (tx) => {
        // 1. Update Referral
        await tx.referral.update({
            where: { id: referral.id },
            data: {
                status: 'CONVERTED',
                refereeId: newUserId,
            }
        });

        // 2. Credit Referrer Organization
        await this.addCredits(tx, referral.referrer.organizationId, 50, `Referral Reward: Invited ${newUser.email}`);

        // 3. Credit Referee Organization
        await this.addCredits(tx, newUser.organizationId, 50, `Referral Bonus: Invited by ${referral.referrer.email}`);
    });

    return { success: true };
  }

  private static async addCredits(tx: Prisma.TransactionClient, organizationId: string, amount: number, description: string) {
      // Get last transaction to calculate balance
      const lastTx = await tx.creditTransaction.findFirst({
          where: { organizationId },
          orderBy: { createdAt: 'desc' }
      });

      const currentBalance = lastTx ? Number(lastTx.balanceAfter) : 0;
      const newBalance = currentBalance + amount;

      await tx.creditTransaction.create({
          data: {
              organizationId,
              amount: new Prisma.Decimal(amount),
              type: 'CREDIT',
              description,
              balanceAfter: new Prisma.Decimal(newBalance),
          }
      });
  }

  static async getReferralStats(userId: string) {
      const referrals = await prisma.referral.findMany({
          where: { referrerId: userId },
          orderBy: { createdAt: 'desc' }
      });

      const totalRewards = referrals
        .filter(r => r.status === 'CONVERTED')
        .reduce((sum, r) => sum + r.rewardAmount, 0);

      return {
          totalReferrals: referrals.length,
          convertedReferrals: referrals.filter(r => r.status === 'CONVERTED').length,
          totalRewards,
          referrals
      };
  }
}
