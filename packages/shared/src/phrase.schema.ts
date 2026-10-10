import { z } from 'zod';

export const createPhraseSchema = z.object({
  enText: z.string().min(1),
  ruGloss: z.string().optional(),
  usageNote: z.string().optional(),
  source: z.enum([
    'manual',
    'free_talk',
    'telegram',
    'lesson_seed',
    'lesson_writing',
    'lesson_speaking',
    'grammar_feedback',
  ]),
  category: z.string().optional(),
});

export type CreatePhraseInput = z.infer<typeof createPhraseSchema>;

export const extractPhrasesRequestSchema = z.object({
  text: z.string().min(1),
});

export type ExtractPhrasesRequestInput = z.infer<typeof extractPhrasesRequestSchema>;

export const bulkAddPhrasesSchema = z.object({
  phrases: z
    .array(
      z.object({
        enText: z.string().min(1),
        ruGloss: z.string().optional(),
        usageNote: z.string().optional(),
      }),
    )
    .min(1),
  category: z.string().optional(),
});

export type BulkAddPhrasesInput = z.infer<typeof bulkAddPhrasesSchema>;

export const confirmLessonPhrasesSchema = z.object({
  phrases: z
    .array(
      z.object({
        enText: z.string().min(1),
        ruGloss: z.string().optional(),
        usageNote: z.string().optional(),
      }),
    )
    .min(1),
  source: z.enum(['lesson_writing', 'lesson_speaking', 'grammar_feedback']),
});

export type ConfirmLessonPhrasesInput = z.infer<typeof confirmLessonPhrasesSchema>;
