import { z } from 'zod';

export const CNPJEnrichmentResultSchema = z.object({
  cnpj: z.string(),
  legalName: z.string(),
  tradeName: z.string().optional(),
  foundedDate: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }),
  phones: z.array(z.string()),
  emails: z.array(z.string()),
  cnae: z.object({
    code: z.string(),
    description: z.string(),
  }),
});

export type CNPJEnrichmentResultDto = z.infer<typeof CNPJEnrichmentResultSchema>;
