import { NextResponse } from 'next/server';
import { prisma, stripe } from '@salesos/core';
import { z } from 'zod';

const cancelSchema = z.object({
  organizationId: z.string(),
  reason: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId, reason } = cancelSchema.parse(body);

    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org || !org.stripeCustomerId) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    // Cycle 30: Save Offer Logic
    if (reason === 'too_expensive' || reason === 'price') {
      // Check if already used save offer? (Future improvement)
      return NextResponse.json({
        offer: {
          type: 'discount',
          percent_off: 30,
          duration: '3_months',
          message: 'Que tal 30% de desconto nos próximos 3 meses para continuar com a gente?'
        }
      });
    }

    // If no offer applies, proceed to cancel at period end
    const subscriptions = await stripe.subscriptions.list({ customer: org.stripeCustomerId, status: 'active' });
    const sub = subscriptions.data[0];

    if (sub) {
      await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
    }

    return NextResponse.json({ status: 'canceled_at_period_end' });

  } catch (error) {
    console.error('Cancel failed:', error);
    return NextResponse.json({ error: 'Failed to process cancellation' }, { status: 500 });
  }
}
