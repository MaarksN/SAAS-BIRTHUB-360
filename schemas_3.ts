import { z } from 'zod';

export const LeadScoreSchema = z.object({
  leadId: z.string(),
  score: z.number().min(0).max(100),
  factors: z.object({
    behavioral: z.number(),
    demographic: z.number()
  }),
});

export const MeetingAnalysisSchema = z.object({
  summary: z.string(),
  sentiment: z.enum(['Positive', 'Neutral', 'Negative']),
  actionItems: z.array(z.string()),
});

export type LeadScoreDto = z.infer<typeof LeadScoreSchema>;
export type MeetingAnalysisDto = z.infer<typeof MeetingAnalysisSchema>;
