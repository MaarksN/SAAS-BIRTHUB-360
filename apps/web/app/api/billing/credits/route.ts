import { NextResponse } from 'next/server';
import { stripe } from '@salesos/core';
import { z } from 'zod';

const creditSchema = z.object({
  organizationId: z.string(),
  amount: z.number().positive(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId, amount, successUrl, cancelUrl } = creditSchema.parse(body);

    // Assume 1 credit = $0.01 for simplicity or map amounts to packages
    // Let's say user buys $10, $50, $100 packages
    const unitAmount = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Add ${amount} Credits`,
              description: 'Prepaid credits for AI usage',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        organizationId,
        type: 'CREDITS',
        creditAmount: amount.toString(),
      },
      client_reference_id: organizationId,
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Credit checkout failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
