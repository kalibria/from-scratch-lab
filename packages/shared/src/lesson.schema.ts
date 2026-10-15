import { z } from 'zod';

export const lessonProgressStepSchema = z.object({
  step: z.enum(['vocab', 'grammar', 'writing', 'speaking', 'reading', 'video', 'checkpoint']),
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

export const startLessonReadingSchema = z.object({
  sessionId: z.number().int(),
});

export type StartLessonReadingInput = z.infer<typeof startLessonReadingSchema>;

export const submitLessonReadingTurnSchema = z.object({
  lessonReadingSessionId: z.number().int(),
  userUtterance: z.string().min(1),
});

export type SubmitLessonReadingTurnInput = z.infer<typeof submitLessonReadingTurnSchema>;

export const submitLessonVideoReflectionSchema = z.object({
  sessionId: z.number().int(),
  lessonId: z.number().int(),
  reflection: z.string().min(1),
});

export type SubmitLessonVideoReflectionInput = z.infer<typeof submitLessonVideoReflectionSchema>;
