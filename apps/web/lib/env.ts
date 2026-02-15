import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  AI_AGENT_URL: z.string().url().default('http://localhost:8000'),
  REDIS_URL: z.string().url().optional(),
  FEATURE_AI_ENABLED: z.enum(['true', 'false']).optional(),
  FEATURE_BILLING_ENABLED: z.enum(['true', 'false']).optional(),
});

// Allow skipping validation for now if needed, e.g. during specific build steps where env might not be present
const skipValidation = Boolean(process.env.SKIP_ENV_VALIDATION);

const _env = envSchema.safeParse(process.env);

if (!skipValidation && !_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.success ? _env.data : (process.env as unknown as z.infer<typeof envSchema>);
