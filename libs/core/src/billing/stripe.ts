import Stripe from 'stripe';
import { env } from '../env';

if (!env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing. Billing features will not work.');
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any, // Use latest stable
  typescript: true,
});

export const createCheckoutSession = async (priceId: string, customerId?: string, successUrl = `${env.NODE_ENV === 'production' ? 'https://app.salesos.com' : 'http://localhost:3000'}/dashboard?success=true`, cancelUrl = `${env.NODE_ENV === 'production' ? 'https://app.salesos.com' : 'http://localhost:3000'}/pricing`) => {
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  };

  if (customerId) {
    sessionConfig.customer = customerId;
  } else {
    sessionConfig.customer_creation = 'always';
  }

  return stripe.checkout.sessions.create(sessionConfig);
};

export const createPortalSession = async (customerId: string, returnUrl = `${env.NODE_ENV === 'production' ? 'https://app.salesos.com' : 'http://localhost:3000'}/dashboard`) => {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
};
