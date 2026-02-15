import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().describe('PostgreSQL connection string'),
  REDIS_URL: z.string().url().optional().default('redis://localhost:6379'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().optional().default(3000),

  // Auth
  NEXTAUTH_SECRET: z.string().min(1).optional().describe('Secret for NextAuth.js'),
  NEXTAUTH_URL: z.string().url().optional().describe('Base URL for NextAuth.js'),
  JWT_SECRET: z.string().min(1).optional().describe('Secret for JWT signing'),

  // API
  NEXT_PUBLIC_API_URL: z.string().url().optional().default('http://localhost:3000/api'),

  // AI Providers
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // Payments
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  // Email
  RESEND_API_KEY: z.string().min(1).optional(),
  DEFAULT_FROM_EMAIL: z.string().email().optional().default('onboarding@resend.dev'),

  // Admin
  ADMIN_SECRET: z.string().optional(),

  // Integrations
  HUBSPOT_CLIENT_ID: z.string().optional(),
  HUBSPOT_CLIENT_SECRET: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Admin Setup
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),

  // CI/CD
  SKIP_ENV_VALIDATION: z.enum(['true', 'false', '1', '0']).optional().transform((val) => val === 'true' || val === '1'),
});

const _env = process.env.SKIP_ENV_VALIDATION === 'true' || process.env.SKIP_ENV_VALIDATION === '1'
  ? { success: true, data: process.env as any }
  : envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data as z.infer<typeof envSchema>;
