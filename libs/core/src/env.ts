import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  REDIS_URL: z.string().url().optional().default('redis://localhost:6379'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().optional().default(3000),
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  DEFAULT_FROM_EMAIL: z.string().email().optional(),
  HUBSPOT_CLIENT_ID: z.string().min(1).optional(),
  HUBSPOT_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_PLACES_API_KEY: z.string().min(1).optional(),
  SERP_API_KEY: z.string().min(1).optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
