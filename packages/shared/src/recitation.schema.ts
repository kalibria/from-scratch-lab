import { z } from 'zod';

export const generateRecitationTextSchema = z.object({
  topic: z.string().min(1).optional(),
  category: z.string().optional(),
});

export type GenerateRecitationTextInput = z.infer<typeof generateRecitationTextSchema>;

export const startRecitationSessionSchema = z.object({
  sessionId: z.number().int(),
  recitationTextId: z.number().int(),
});

export type StartRecitationSessionInput = z.infer<typeof startRecitationSessionSchema>;

export const submitRecitationTurnSchema = z.object({
  recitationSessionId: z.number().int(),
  userUtterance: z.string().min(1),
});

export type SubmitRecitationTurnInput = z.infer<typeof submitRecitationTurnSchema>;
