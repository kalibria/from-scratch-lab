import { z } from 'zod';

export const createSessionSchema = z.object({
  plannedMinutes: z.number().int().positive(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
