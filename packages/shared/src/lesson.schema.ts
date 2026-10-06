import { z } from 'zod';

export const lessonProgressStepSchema = z.object({
  step: z.enum(['vocab', 'grammar', 'writing', 'speaking', 'checkpoint']),
  score: z.number().int().optional(),
});

export type LessonProgressStepInput = z.infer<typeof lessonProgressStepSchema>;

export const submitWritingAttemptSchema = z.object({
  sessionId: z.number().int(),
  lessonId: z.number().int(),
  prompt: z.string().min(1),
  userAnswer: z.string().min(1),
});

export type SubmitWritingAttemptInput = z.infer<typeof submitWritingAttemptSchema>;
