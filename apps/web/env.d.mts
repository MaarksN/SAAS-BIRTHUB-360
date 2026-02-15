import { z } from 'zod';

const server = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

const client = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

const merged = server.merge(client);

export declare const env: z.infer<typeof merged>;
