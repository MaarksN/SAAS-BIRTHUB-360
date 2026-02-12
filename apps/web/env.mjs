import { z } from "zod";

const server = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    (str) => process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : str,
    process.env.VERCEL ? z.string().min(1) : z.string().url()
  ),
});

const client = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

/**
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

// Merge for validation
const merged = server.merge(client);

/** @type {import('zod').SafeParseReturnType<z.infer<typeof merged>, z.infer<typeof merged>>} */
const parsed = !!process.env.SKIP_ENV_VALIDATION
  ? { success: true, data: processEnv }
  : merged.safeParse(processEnv);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
