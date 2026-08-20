import { z } from 'zod';

export const analyzeFreeTalkSchema = z.object({
  sessionId: z.number().int(),
  promptTopic: z.string().min(1),
  userResponse: z.string().min(1),
});

export type AnalyzeFreeTalkInput = z.infer<typeof analyzeFreeTalkSchema>;

export const confirmPhrasesSchema = z.object({
  sessionId: z.number().int(),
  phrases: z
    .array(
      z.object({
        enText: z.string().min(1),
        ruGloss: z.string().optional(),
        usageNote: z.string().optional(),
      }),
    )
    .min(1),
});

export type ConfirmPhrasesInput = z.infer<typeof confirmPhrasesSchema>;
