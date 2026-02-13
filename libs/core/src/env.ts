import { z } from 'zod';

const envSchema = z.object({
  // Database & Redis
  DATABASE_URL: z.string().url().describe('PostgreSQL connection string'),
  REDIS_URL: z.string().url().default('redis://localhost:6379').describe('Redis connection string'),

  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().optional().default(3000),

  // Auth (NextAuth)
  NEXTAUTH_URL: z.preprocess(
    (str) => process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : str,
    process.env.VERCEL ? z.string().min(1) : z.string().url().optional()
  ),
  NEXTAUTH_SECRET: z.string().min(1).optional(),

  // AI Provider Keys
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // Payment (Stripe)
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().min(1).optional(),
  DEFAULT_FROM_EMAIL: z.string().email().optional().default('onboarding@resend.dev'),

  // Security
  CORS_ALLOWED_ORIGINS: z.string().optional().default('*'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
