import { z } from 'zod';

export const BuyingCommitteeContactSchema = z.object({
  name: z.string(),
  role: z.string(),
  influenceLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});

export const BuyingCommitteeMapSchema = z.object({
  companyId: z.string(),
  contacts: z.array(BuyingCommitteeContactSchema),
});

export const EmailValidationSchema = z.object({
  email: z.string().email(),
  isValid: z.boolean(),
  score: z.number().min(0).max(1),
});

export type BuyingCommitteeMapDto = z.infer<typeof BuyingCommitteeMapSchema>;
export type EmailValidationDto = z.infer<typeof EmailValidationSchema>;
