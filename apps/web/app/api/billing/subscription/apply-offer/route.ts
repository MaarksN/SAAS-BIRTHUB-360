import { NextResponse } from 'next/server';
import { prisma, stripe } from '@salesos/core';
import { z } from 'zod';

const offerSchema = z.object({
  organizationId: z.string(),
  offerType: z.literal('discount'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId, offerType } = offerSchema.parse(body);

    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org || !org.stripeCustomerId) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const subscriptions = await stripe.subscriptions.list({ customer: org.stripeCustomerId, status: 'active' });
    const sub = subscriptions.data[0];

    if (!sub) return NextResponse.json({ error: 'No active subscription' }, { status: 404 });

    // In a real system, we'd lookup or create a coupon via Stripe API
    // For this Cycle 30 task, we simulate applying a known coupon code 'SAVE30'
    // Make sure this coupon exists in Stripe Dashboard!
    const couponId = 'SAVE30';

    // Create/Verify coupon if needed (idempotent)
    try {
        await stripe.coupons.retrieve(couponId);
    } catch {
        await stripe.coupons.create({
            id: couponId,
            percent_off: 30,
            duration: 'repeating',
            duration_in_months: 3,
            name: '30% OFF Save Offer',
        });
    }

    await stripe.subscriptions.update(sub.id, {
        coupon: couponId,
    });

    return NextResponse.json({ success: true, message: 'Discount applied!' });

  } catch (error) {
    console.error('Apply offer failed:', error);
    return NextResponse.json({ error: 'Failed to apply offer' }, { status: 500 });
  }
}
