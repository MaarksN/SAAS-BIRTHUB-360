import { z } from "zod";

export const leadSchema = z.object({
  companyName: z.string().min(2, "O nome da empresa deve ter pelo menos 2 caracteres"),
  email: z.string().email("Formato de e-mail inválido").optional().or(z.literal('')),
  score: z.number().min(0).max(100),
  website: z.string().url("URL inválida").optional().or(z.literal('')),
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
