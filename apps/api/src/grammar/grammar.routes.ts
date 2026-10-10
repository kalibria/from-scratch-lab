import { Router } from 'express';
import { and, asc, eq, inArray, isNull, lte, sql, type SQL } from 'drizzle-orm';
import { submitGrammarAttemptSchema } from '@app/shared';
import { db } from '../db/client.js';
import { grammarTopics, grammarTopicState, grammarExercises, grammarExerciseAttempts } from '../db/schema.js';
import { generateGrammarExercise } from '../agent/generate-grammar-exercise.js';
import { evaluateGrammarAnswer } from '../agent/evaluate-grammar-answer.js';
import { computeNextSrsState } from '../srs/compute-next-srs-state.js';

export const grammarRouter = Router();

async function selectDueTopic(extraCondition: SQL, orderBy: SQL) {
  const [row] = await db
    .select({ topic: grammarTopics, box: grammarTopicState.box })
    .from(grammarTopicState)
    .innerJoin(grammarTopics, eq(grammarTopicState.topicId, grammarTopics.id))
    .where(and(lte(grammarTopicState.nextReviewAt, new Date()), extraCondition))
    .orderBy(orderBy)
    .limit(1);

  return row ?? null;
}

async function selectSpecificTopic(topicId: number) {
  const [row] = await db
    .select({ topic: grammarTopics, box: grammarTopicState.box })
    .from(grammarTopicState)
    .innerJoin(grammarTopics, eq(grammarTopicState.topicId, grammarTopics.id))
    .where(eq(grammarTopics.id, topicId));

  return row ?? null;
}

async function findTopic() {
  return (
    (await selectDueTopic(
      inArray(grammarTopicState.lastResult, ['incorrect', 'close']),
      asc(grammarTopicState.nextReviewAt),
    )) ??
    (await selectDueTopic(eq(grammarTopicState.lastResult, 'correct'), asc(grammarTopicState.nextReviewAt))) ??
    (await selectDueTopic(isNull(grammarTopicState.lastResult), asc(grammarTopics.id)))
  );
}

async function selectUnseenExercise(topicId: number) {
  const [row] = await db
    .select({ exercise: grammarExercises })
    .from(grammarExercises)
    .leftJoin(grammarExerciseAttempts, eq(grammarExerciseAttempts.exerciseId, grammarExercises.id))
    .where(and(eq(grammarExercises.topicId, topicId), isNull(grammarExerciseAttempts.id)))
    .orderBy(sql`random()`)
    .limit(1);

  return row?.exercise ?? null;
}

async function selectLeastRecentlyAttemptedExercise(topicId: number) {
  const lastAttemptAt = sql<string>`max(${grammarExerciseAttempts.createdAt})`;

  const [row] = await db
    .select({ exercise: grammarExercises, lastAttemptAt })
    .from(grammarExercises)
    .innerJoin(grammarExerciseAttempts, eq(grammarExerciseAttempts.exerciseId, grammarExercises.id))
    .where(eq(grammarExercises.topicId, topicId))
    .groupBy(grammarExercises.id)
    .orderBy(asc(lastAttemptAt))
    .limit(1);

  return row?.exercise ?? null;
}

async function selectBankExercise(topicId: number) {
  return (await selectUnseenExercise(topicId)) ?? (await selectLeastRecentlyAttemptedExercise(topicId));
}

grammarRouter.get('/next', async (req, res) => {
  const topicId = Number(req.query.topicId);
  const found = Number.isInteger(topicId) ? await selectSpecificTopic(topicId) : await findTopic();

  if (!found) {
    return res.status(204).end();
  }

  const bankExercise = await selectBankExercise(found.topic.id);

  if (bankExercise) {
    return res.json({
      topicId: found.topic.id,
      topicName: found.topic.name,
      level: found.topic.level,
      box: found.box,
      exerciseId: bankExercise.id,
      prompt: bankExercise.prompt,
    });
  }

  const prompt = await generateGrammarExercise(found.topic.name, found.topic.description ?? '');

  res.json({
    topicId: found.topic.id,
    topicName: found.topic.name,
    level: found.topic.level,
    box: found.box,
    exerciseId: null,
    prompt,
  });
});

grammarRouter.post('/attempt', async (req, res) => {
  const parsed = submitGrammarAttemptSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { sessionId, topicId, exerciseId, exercisePrompt, userAnswer } = parsed.data;

  const [topic] = await db.select().from(grammarTopics).where(eq(grammarTopics.id, topicId));
  if (!topic) {
    return res.status(404).json({ error: 'grammar topic not found' });
  }

  const [currentState] = await db.select().from(grammarTopicState).where(eq(grammarTopicState.topicId, topicId));
  if (!currentState) {
    return res.status(404).json({ error: 'grammar topic state not found' });
  }

  const bankExercise = exerciseId
    ? (await db.select().from(grammarExercises).where(eq(grammarExercises.id, exerciseId)))[0]
    : undefined;

  let verdict: 'correct' | 'incorrect' | 'close';
  let feedback: string;
  let suggestedPhrases: { enText: string; ruGloss?: string; usageNote?: string }[] = [];

  if (bankExercise?.correctAnswer) {
    const normalize = (value: string) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:]+$/, '')
        .replace(/\s+/g, ' ');
    const isMatch = normalize(userAnswer) === normalize(bankExercise.correctAnswer);
    verdict = isMatch ? 'correct' : 'incorrect';
    feedback = isMatch ? 'Correct!' : `Not quite — correct answer: "${bankExercise.correctAnswer}"`;
  } else {
    ({ verdict, feedback, suggestedPhrases } = await evaluateGrammarAnswer(topic.name, exercisePrompt, userAnswer));
  }

  const nextState = computeNextSrsState(currentState, verdict, new Date());

  await db.transaction(async (tx) => {
    await tx.update(grammarTopicState).set(nextState).where(eq(grammarTopicState.topicId, topicId));
    await tx.insert(grammarExerciseAttempts).values({
      sessionId,
      topicId,
      exerciseId: exerciseId ?? null,
      exercisePrompt,
      userAnswer,
      verdict,
      agentFeedback: feedback,
    });
  });

  res.json({ verdict, feedback, box: nextState.box, previousBox: currentState.box, suggestedPhrases });
});
