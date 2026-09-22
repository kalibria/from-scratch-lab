import { Router } from 'express';
import { and, asc, count, desc, eq, inArray, isNull, lte, or, type SQL } from 'drizzle-orm';
import { submitDrillAttemptSchema } from '@app/shared';
import { db } from '../db/client.js';
import { phrases, srsState, drillAttempts } from '../db/schema.js';
import { evaluateDrillAnswer } from '../agent/evaluate-drill-answer.js';
import { computeNextSrsState } from '../srs/compute-next-srs-state.js';

export const drillRouter = Router();

const NEW_PHRASE_POOL_SIZE = 30;
const MAX_NEW_PHRASES_PER_SESSION = 5;
const BUILT_IN_TOPICS = new Set(['collocation', 'phrasal_verb', 'idiom', 'free_talk']);

function parseTopicFilter(raw: unknown): SQL | undefined {
  const values = typeof raw === 'string' ? raw.split(',').filter(Boolean) : [];

  if (values.length === 0) {
    return undefined;
  }

  const includeFreeTalk = values.includes('free_talk');
  const categories = values.filter((v) => v !== 'free_talk');

  const conditions: SQL[] = [];
  if (categories.length > 0) {
    conditions.push(inArray(phrases.category, categories));
  }
  if (includeFreeTalk) {
    conditions.push(eq(phrases.source, 'free_talk'));
  }

  return or(...conditions);
}

function isWidenableTopicFilter(raw: unknown): boolean {
  const values = typeof raw === 'string' ? raw.split(',').filter(Boolean) : [];
  return values.length > 0 && values.every((v) => BUILT_IN_TOPICS.has(v));
}

async function selectDuePhrase(extraCondition: SQL, orderBy: SQL, topicFilter: SQL | undefined) {
  const [row] = await db
    .select({ phrase: phrases, box: srsState.box })
    .from(srsState)
    .innerJoin(phrases, eq(srsState.phraseId, phrases.id))
    .where(and(lte(srsState.nextReviewAt, new Date()), extraCondition, topicFilter))
    .orderBy(orderBy)
    .limit(1);

  return row ?? null;
}

async function selectNewPhrase(topicFilter: SQL | undefined) {
  const pool = await db
    .select({ phrase: phrases, box: srsState.box })
    .from(srsState)
    .innerJoin(phrases, eq(srsState.phraseId, phrases.id))
    .where(and(lte(srsState.nextReviewAt, new Date()), isNull(srsState.lastResult), topicFilter))
    .orderBy(desc(phrases.createdAt))
    .limit(NEW_PHRASE_POOL_SIZE);

  if (pool.length === 0) {
    return null;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

async function selectNewPhraseIfUnderCap(sessionId: number, topicFilter: SQL | undefined) {
  if (!Number.isInteger(sessionId)) {
    return selectNewPhrase(topicFilter);
  }

  const [{ value }] = await db
    .select({ value: count() })
    .from(drillAttempts)
    .where(and(eq(drillAttempts.sessionId, sessionId), eq(drillAttempts.wasNew, true)));

  if (value >= MAX_NEW_PHRASES_PER_SESSION) {
    return null;
  }

  return selectNewPhrase(topicFilter);
}

async function findPhrase(sessionId: number, topicFilter: SQL | undefined) {
  return (
    (await selectDuePhrase(
      inArray(srsState.lastResult, ['incorrect', 'close']),
      asc(srsState.nextReviewAt),
      topicFilter,
    )) ??
    (await selectDuePhrase(eq(srsState.lastResult, 'correct'), asc(srsState.nextReviewAt), topicFilter)) ??
    (await selectNewPhraseIfUnderCap(sessionId, topicFilter))
  );
}

drillRouter.get('/next', async (req, res) => {
  const sessionId = Number(req.query.sessionId);
  const topicFilter = parseTopicFilter(req.query.topics);

  const primary = await findPhrase(sessionId, topicFilter);

  if (primary) {
    return res.json({ ...primary.phrase, box: primary.box, expandedBeyondTopic: false });
  }

  if (topicFilter && isWidenableTopicFilter(req.query.topics)) {
    const widened = await findPhrase(sessionId, undefined);

    if (widened) {
      return res.json({ ...widened.phrase, box: widened.box, expandedBeyondTopic: true });
    }
  }

  res.status(204).end();
});

drillRouter.post('/attempt', async (req, res) => {
  const parsed = submitDrillAttemptSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { sessionId, phraseId, userAnswer, revealed } = parsed.data;

  const [phrase] = await db.select().from(phrases).where(eq(phrases.id, phraseId));
  if (!phrase) {
    return res.status(404).json({ error: 'phrase not found' });
  }

  const [currentSrs] = await db.select().from(srsState).where(eq(srsState.phraseId, phraseId));
  if (!currentSrs) {
    return res.status(404).json({ error: 'srs state not found' });
  }

  const isExactMatch = userAnswer.trim().toLowerCase() === phrase.enText.trim().toLowerCase();

  const { verdict, feedback, nativePhrase } = revealed
    ? { verdict: 'incorrect' as const, feedback: 'Answer revealed.', nativePhrase: phrase.enText }
    : isExactMatch
      ? { verdict: 'correct' as const, feedback: 'Exact match.', nativePhrase: phrase.enText }
      : await evaluateDrillAnswer(phrase.enText, userAnswer);
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

  res.json({
    verdict,
    feedback,
    nativePhrase,
    nextReviewAt: nextState.nextReviewAt,
    improvedFromPrevious,
    box: nextState.box,
    previousBox: currentSrs.box,
  });
});
