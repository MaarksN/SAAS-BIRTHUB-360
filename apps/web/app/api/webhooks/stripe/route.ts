import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe, prisma, env, redis, createTransaction } from '@salesos/core';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Idempotency check using Redis
  const processedKey = `processed_webhook:${event.id}`;
  const isProcessed = await redis.get(processedKey);

  if (isProcessed) {
    return NextResponse.json({ received: true });
  }

  // Mark as processed (expiry 24h)
  await redis.setex(processedKey, 86400, 'true');

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // If mode is subscription, update organization
      if (session.mode === 'subscription') {
        const organizationId = session.metadata?.organizationId;
        const planKey = session.metadata?.planKey; // Expecting 'PRO', 'ENTERPRISE'

        if (organizationId && planKey) {
            // Fetch plan ID from DB
            const plan = await prisma.subscriptionPlan.findUnique({
                where: { name: planKey }
            });

            if (plan) {
                const subscriptionId = session.subscription as string;
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                await prisma.organization.update({
                    where: { id: organizationId },
                    data: {
                        stripeCustomerId: session.customer as string,
                        subscriptionStatus: subscription.status,
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        planId: plan.id
                    }
                });
            }
        }
      } else if (session.mode === 'payment') {
          // Handle one-time credit purchase
          const organizationId = session.metadata?.organizationId;
          const type = session.metadata?.type;
          const creditAmount = session.metadata?.creditAmount;

          if (organizationId && type === 'CREDITS' && creditAmount) {
              const amount = parseFloat(creditAmount);

              // Add credits to ledger
              await createTransaction(
                  organizationId,
                  amount,
                  'CREDIT',
                  `Top-up via Stripe Session ${session.id}`,
                  session.id
              );
          }
      }
    } else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      // Update subscription status and period end
      // Need to find org by stripeCustomerId
      const org = await prisma.organization.findFirst({
          where: { stripeCustomerId: invoice.customer as string }
      });

      if (org && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await prisma.organization.update({
              where: { id: org.id },
              data: {
                  subscriptionStatus: subscription.status,
                  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              }
          });
      }
    } else if (event.type === 'customer.subscription.deleted') {
       const subscription = event.data.object as Stripe.Subscription;
       const org = await prisma.organization.findFirst({
           where: { stripeCustomerId: subscription.customer as string }
       });

       if (org) {
           await prisma.organization.update({
               where: { id: org.id },
               data: {
                   subscriptionStatus: 'canceled',
                   planId: null // Reset plan or handle grace period
               }
           });
       }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook handler failed: ${error.message}`);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
