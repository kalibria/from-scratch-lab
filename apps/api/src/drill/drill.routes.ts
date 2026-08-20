import { Router } from 'express';
import { asc, eq, lte } from 'drizzle-orm';
import { submitDrillAttemptSchema } from '@app/shared';
import { db } from '../db/client.js';
import { phrases, srsState, drillAttempts } from '../db/schema.js';
import { evaluateDrillAnswer } from '../agent/evaluate-drill-answer.js';
import { computeNextSrsState } from '../srs/compute-next-srs-state.js';

export const drillRouter = Router();

drillRouter.get('/next', async (_req, res) => {
  const [due] = await db
    .select({ phrase: phrases, srs: srsState })
    .from(srsState)
    .innerJoin(phrases, eq(srsState.phraseId, phrases.id))
    .where(lte(srsState.nextReviewAt, new Date()))
    .orderBy(asc(srsState.nextReviewAt))
    .limit(1);

  if (!due) {
    return res.status(204).end();
  }

  res.json(due.phrase);
});

drillRouter.post('/attempt', async (req, res) => {
  const parsed = submitDrillAttemptSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { sessionId, phraseId, userAnswer } = parsed.data;

  const [phrase] = await db.select().from(phrases).where(eq(phrases.id, phraseId));
  if (!phrase) {
    return res.status(404).json({ error: 'phrase not found' });
  }

  const [currentSrs] = await db.select().from(srsState).where(eq(srsState.phraseId, phraseId));
  if (!currentSrs) {
    return res.status(404).json({ error: 'srs state not found' });
  }

  const { verdict, feedback, nativePhrase } = await evaluateDrillAnswer(phrase.enText, userAnswer);
  const nextState = computeNextSrsState(currentSrs, verdict, new Date());

  const wasStruggling = currentSrs.lastResult === 'incorrect' || currentSrs.lastResult === 'close';
  const improvedFromPrevious = verdict === 'correct' && wasStruggling;

  await db.transaction(async (tx) => {
    await tx.update(srsState).set(nextState).where(eq(srsState.phraseId, phraseId));
    await tx.insert(drillAttempts).values({ sessionId, phraseId, userAnswer, verdict, agentFeedback: feedback });
  });

  res.json({ verdict, feedback, nativePhrase, nextReviewAt: nextState.nextReviewAt, improvedFromPrevious });
});
