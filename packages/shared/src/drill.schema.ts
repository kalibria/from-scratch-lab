import { z } from 'zod';

export const submitDrillAttemptSchema = z.object({
  sessionId: z.number().int(),
  phraseId: z.number().int(),
  userAnswer: z.string().min(1),
});

export type SubmitDrillAttemptInput = z.infer<typeof submitDrillAttemptSchema>;
