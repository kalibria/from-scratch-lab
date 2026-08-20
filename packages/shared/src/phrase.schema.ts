import { z } from 'zod';

export const createPhraseSchema = z.object({
  enText: z.string().min(1),
  ruGloss: z.string().optional(),
  source: z.enum(['manual', 'free_talk']),
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
      }),
    )
    .min(1),
});

export type BulkAddPhrasesInput = z.infer<typeof bulkAddPhrasesSchema>;
