import { NextResponse } from 'next/server';
import { stripe, prisma, PLANS } from '@salesos/core';
import { z } from 'zod';

const checkoutSchema = z.object({
  planKey: z.enum(['PRO', 'ENTERPRISE']),
  organizationId: z.string(),
  userId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planKey, organizationId, userId, successUrl, cancelUrl } = checkoutSchema.parse(body);

    const plan = PLANS[planKey];
    if (!plan) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Ensure plan exists in DB (sync if needed)
    // Ideally this is done at boot, but checking here is safe
    let dbPlan = await prisma.subscriptionPlan.findUnique({ where: { name: plan.name } });
    if (!dbPlan) {
        // Fallback sync (or fail)
        // For now, assuming plans are seeded
        return NextResponse.json({ error: 'Plan configuration missing' }, { status: 500 });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SalesOS ${plan.name}`,
              description: JSON.stringify(plan.features),
            },
            unit_amount: Math.round(plan.priceMonthly * 100), // in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        organizationId,
        userId,
        planKey,
        source: 'app_upgrade_modal',
      },
      client_reference_id: organizationId,
      allow_promotion_codes: true,
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
            organizationId,
            planKey
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout creation failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
