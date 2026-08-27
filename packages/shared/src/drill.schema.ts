import { z } from 'zod';

export const submitDrillAttemptSchema = z.object({
  sessionId: z.number().int(),
  phraseId: z.number().int(),
  userAnswer: z.string(),
  revealed: z.boolean().optional(),
});

export type SubmitDrillAttemptInput = z.infer<typeof submitDrillAttemptSchema>;
