import { Router } from 'express';
import { and, asc, eq, inArray, isNull, lte, type SQL } from 'drizzle-orm';
import { submitGrammarAttemptSchema } from '@app/shared';
import { db } from '../db/client.js';
import { grammarTopics, grammarTopicState, grammarExerciseAttempts } from '../db/schema.js';
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

grammarRouter.get('/next', async (_req, res) => {
  const found = await findTopic();

  if (!found) {
    return res.status(204).end();
  }

  const prompt = await generateGrammarExercise(found.topic.name, found.topic.description ?? '');

  res.json({
    topicId: found.topic.id,
    topicName: found.topic.name,
    level: found.topic.level,
    box: found.box,
    prompt,
  });
});

grammarRouter.post('/attempt', async (req, res) => {
  const parsed = submitGrammarAttemptSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { sessionId, topicId, exercisePrompt, userAnswer } = parsed.data;

  const [topic] = await db.select().from(grammarTopics).where(eq(grammarTopics.id, topicId));
  if (!topic) {
    return res.status(404).json({ error: 'grammar topic not found' });
  }

  const [currentState] = await db.select().from(grammarTopicState).where(eq(grammarTopicState.topicId, topicId));
  if (!currentState) {
    return res.status(404).json({ error: 'grammar topic state not found' });
  }

  const { verdict, feedback } = await evaluateGrammarAnswer(topic.name, exercisePrompt, userAnswer);
  const nextState = computeNextSrsState(currentState, verdict, new Date());

  await db.transaction(async (tx) => {
    await tx.update(grammarTopicState).set(nextState).where(eq(grammarTopicState.topicId, topicId));
    await tx.insert(grammarExerciseAttempts).values({
      sessionId,
      topicId,
      exercisePrompt,
      userAnswer,
      verdict,
      agentFeedback: feedback,
    });
  });

  res.json({ verdict, feedback, box: nextState.box, previousBox: currentState.box });
});
