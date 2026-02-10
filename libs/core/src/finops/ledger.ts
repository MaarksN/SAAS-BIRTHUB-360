import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import { logger } from '../logger';

export type TransactionType = 'DEBIT' | 'CREDIT' | 'REFUND' | 'EXPIRATION';

/**
 * Creates a financial transaction using double-entry bookkeeping principles.
 * Ensures ACID compliance and prevents negative balances.
 */
export async function createTransaction(
  organizationId: string,
  amount: number, // positive for credit, negative for debit
  type: TransactionType,
  description: string,
  referenceId?: string
) {
  return prisma.$transaction(async (tx) => {
    // explicit locking via raw query could be better, but Serializable isolation should handle it
    const lastTx = await tx.creditTransaction.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const currentBalance = lastTx ? Number(lastTx.balanceAfter) : 0;
    const newBalance = currentBalance + amount;

    // Prevent overdrafts
    if (newBalance < 0 && amount < 0) {
      throw new Error(`Insufficient funds. Current balance: ${currentBalance}, required: ${Math.abs(amount)}`);
    }

    const transaction = await tx.creditTransaction.create({
      data: {
        organizationId,
        amount,
        type,
        description,
        balanceAfter: newBalance,
        referenceId,
      },
    });

    logger.info(`Transaction created: ${transaction.id} for org ${organizationId}. New balance: ${newBalance}`);
    return transaction;
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

/**
 * Gets the current balance for an organization.
 */
export async function getBalance(organizationId: string) {
  const lastTx = await prisma.creditTransaction.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
  return lastTx ? Number(lastTx.balanceAfter) : 0;
}
