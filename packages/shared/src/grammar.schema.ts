import { z } from 'zod';

export const submitGrammarAttemptSchema = z.object({
  sessionId: z.number().int(),
  topicId: z.number().int(),
  exercisePrompt: z.string().min(1),
  userAnswer: z.string().min(1),
});

export type SubmitGrammarAttemptInput = z.infer<typeof submitGrammarAttemptSchema>;
