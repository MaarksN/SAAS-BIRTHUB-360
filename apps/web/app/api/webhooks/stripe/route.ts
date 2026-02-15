import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@salesos/core/billing/stripe';
import { env } from '@salesos/core/env';
import { prisma } from '@salesos/core/prisma';
import { bypassRLS } from '@salesos/core/rls-middleware';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const clientReferenceId = session.client_reference_id; // Assuming we pass orgId here

        if (clientReferenceId) {
          await prisma.organization.update(bypassRLS({
            where: { id: clientReferenceId },
            data: {
              stripeCustomerId: customerId,
              subscriptionStatus: 'active',
              planId: 'pro', // Default or derived from metadata
            }
          }));
          console.log('Organization subscription activated:', clientReferenceId);
        } else if (customerId) {
            // Try to find via customerId if we missed client_reference_id
             const org = await prisma.organization.findFirst(bypassRLS({
                 where: { stripeCustomerId: customerId }
             }));
             if(org) {
                 await prisma.organization.update(bypassRLS({
                     where: { id: org.id },
                     data: { subscriptionStatus: 'active' }
                 }));
             }
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer;

        const org = await prisma.organization.findFirst(bypassRLS({
            where: { stripeCustomerId: customerId }
        }));

        if (org) {
            await prisma.organization.update(bypassRLS({
                where: { id: org.id },
                data: {
                    subscriptionStatus: 'active',
                    currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000)
                }
            }));
            console.log('Subscription renewed for org:', org.id);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        const org = await prisma.organization.findFirst(bypassRLS({
            where: { stripeCustomerId: customerId }
        }));

        if (org) {
            await prisma.organization.update(bypassRLS({
                where: { id: org.id },
                data: { subscriptionStatus: 'canceled' }
            }));
            console.log('Subscription canceled for org:', org.id);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
