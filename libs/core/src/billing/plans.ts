import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

export const PLANS = {
  FREE: {
    name: 'Free',
    limits: {
      max_leads: 100,
      ai_tokens: 10000,
      features: ['basic_analytics'],
    } as Prisma.JsonObject,
    priceMonthly: 0,
    priceYearly: 0,
  },
  PRO: {
    name: 'Pro',
    limits: {
      max_leads: 1000,
      ai_tokens: 50000,
      features: ['advanced_analytics', 'voice_clone', 'api_access'],
    } as Prisma.JsonObject,
    priceMonthly: 29.99,
    priceYearly: 299.99,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    limits: {
      max_leads: 10000,
      ai_tokens: 500000,
      features: ['all', 'sso', 'dedicated_support'],
    } as Prisma.JsonObject,
    priceMonthly: 99.99,
    priceYearly: 999.99,
  },
};

export async function syncPlans() {
  for (const [key, plan] of Object.entries(PLANS)) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {
        limits: plan.limits,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
      },
      create: {
        name: plan.name,
        limits: plan.limits,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
      },
    });
  }
}

export async function getPlanByName(name: string) {
  return prisma.subscriptionPlan.findUnique({
    where: { name },
  });
}

export async function getPlanById(id: string) {
  return prisma.subscriptionPlan.findUnique({
    where: { id },
  });
}
