import { z } from 'zod';

export const leadSchema = z.object({
  companyName: z
    .string()
    .min(2, 'O nome da empresa deve ter pelo menos 2 caracteres'),
  email: z
    .string()
    .email('Formato de e-mail inválido')
    .optional()
    .or(z.literal('')),
  score: z.number().min(0).max(100),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
});

export type LeadDto = z.infer<typeof leadSchema>;

export const BaseResponseSchema = z.object({
  success: z.boolean().default(true),
  timestamp: z.union([z.string(), z.date()]).optional(),
  request_id: z.string().optional(),
});

export const ErrorResponseSchema = BaseResponseSchema.extend({
  success: z.literal(false),
  error: z.string(),
  error_code: z.string(),
  details: z.record(z.string(), z.any()).optional(),
});

export type BaseResponse = z.infer<typeof BaseResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// --- Consolidated Schemas (Step 3.1) ---

export const LeadSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  company: z.string().min(2),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED']),
});

export type Lead = z.infer<typeof LeadSchema>;

export const AiGenerationSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  model: z.string().optional().default('claude-3-5-sonnet-20241022'),
});

export type AiGenerationRequest = z.infer<typeof AiGenerationSchema>;

// --- Python Agent Parity Schemas (Step 3.2) ---

export const EmailGenerationRequestSchema = z.object({
  lead_name: z.string(),
  company_name: z.string(),
  industry: z.string(),
  pain_points: z.array(z.string()),
  value_proposition: z.string(),
  context: z.string().optional(),
  language: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
});

export type EmailGenerationRequest = z.infer<
  typeof EmailGenerationRequestSchema
>;

export const ICPClassificationRequestSchema = z.object({
  company_name: z.string(),
  about_us: z.string(),
  headline: z.string().optional(),
});

export type ICPClassificationRequest = z.infer<
  typeof ICPClassificationRequestSchema
>;

export const AgentRunRequestSchema = z.object({
  goal: z.string(),
  max_steps: z.number().int().default(10),
  session_id: z.string().optional(),
});

export type AgentRunRequest = z.infer<typeof AgentRunRequestSchema>;

export const CrawlJobPayloadSchema = z.object({
  url: z.string().url(),
  depth: z.number().int().default(1),
  max_pages: z.number().int().default(3),
});

export type CrawlJobPayload = z.infer<typeof CrawlJobPayloadSchema>;
