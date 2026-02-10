import Stripe from 'stripe';
import { env } from '../env';

if (!env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing. Billing features will not work.');
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any, // Use latest stable
  typescript: true,
});
