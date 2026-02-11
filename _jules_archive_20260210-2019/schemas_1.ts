import { z } from 'zod';

export const SmartSearchQuerySchema = z.object({
  query: z.string().min(3).max(500),
  filters: z.record(z.string(), z.any()).optional(),
  limit: z.number().min(1).max(50).default(10),
});

export type SmartSearchQueryDto = z.infer<typeof SmartSearchQuerySchema>;
