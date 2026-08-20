import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { createSessionSchema } from '@app/shared';
import { db } from '../db/client.js';
import { sessions } from '../db/schema.js';

export const sessionsRouter = Router();

sessionsRouter.post('/', async (req, res) => {
  const parsed = createSessionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [session] = await db.insert(sessions).values(parsed.data).returning();
  res.status(201).json(session);
});

sessionsRouter.patch('/:id/end', async (req, res) => {
  const id = Number(req.params.id);
  const [session] = await db.update(sessions).set({ endedAt: new Date() }).where(eq(sessions.id, id)).returning();

  if (!session) {
    return res.status(404).json({ error: 'session not found' });
  }

  res.json(session);
});
