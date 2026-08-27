import { Router } from 'express';
import { and, asc, count, desc, eq, inArray, isNull, lte, type SQL } from 'drizzle-orm';
import { submitDrillAttemptSchema } from '@app/shared';
import { db } from '../db/client.js';
import { phrases, srsState, drillAttempts } from '../db/schema.js';
import { evaluateDrillAnswer } from '../agent/evaluate-drill-answer.js';
import { computeNextSrsState } from '../srs/compute-next-srs-state.js';

export const drillRouter = Router();

const NEW_PHRASE_POOL_SIZE = 30;
const MAX_NEW_PHRASES_PER_SESSION = 5;

async function selectDuePhrase(extraCondition: SQL, orderBy: SQL) {
  const [row] = await db
    .select({ phrase: phrases })
    .from(srsState)
    .innerJoin(phrases, eq(srsState.phraseId, phrases.id))
    .where(and(lte(srsState.nextReviewAt, new Date()), extraCondition))
    .orderBy(orderBy)
    .limit(1);

  return row?.phrase ?? null;
}

async function selectNewPhrase() {
  const pool = await db
    .select({ phrase: phrases })
    .from(srsState)
    .innerJoin(phrases, eq(srsState.phraseId, phrases.id))
    .where(and(lte(srsState.nextReviewAt, new Date()), isNull(srsState.lastResult)))
    .orderBy(desc(phrases.createdAt))
    .limit(NEW_PHRASE_POOL_SIZE);

  if (pool.length === 0) {
    return null;
  }

  return pool[Math.floor(Math.random() * pool.length)].phrase;
}

async function selectNewPhraseIfUnderCap(sessionId: number) {
  if (!Number.isInteger(sessionId)) {
    return selectNewPhrase();
  }

  const [{ value }] = await db
    .select({ value: count() })
    .from(drillAttempts)
    .where(and(eq(drillAttempts.sessionId, sessionId), eq(drillAttempts.wasNew, true)));

  if (value >= MAX_NEW_PHRASES_PER_SESSION) {
    return null;
  }

  return selectNewPhrase();
}

drillRouter.get('/next', async (req, res) => {
  const sessionId = Number(req.query.sessionId);

  const phrase =
    (await selectDuePhrase(inArray(srsState.lastResult, ['incorrect', 'close']), asc(srsState.nextReviewAt))) ??
    (await selectDuePhrase(eq(srsState.lastResult, 'correct'), asc(srsState.nextReviewAt))) ??
    (await selectNewPhraseIfUnderCap(sessionId));

  if (!phrase) {
    return res.status(204).end();
  }

  res.json(phrase);
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
    await tx.insert(drillAttempts).values({
      sessionId,
      phraseId,
      userAnswer,
      verdict,
      agentFeedback: feedback,
      wasNew: currentSrs.lastResult === null,
    });
  });

  res.json({ verdict, feedback, nativePhrase, nextReviewAt: nextState.nextReviewAt, improvedFromPrevious });
});
