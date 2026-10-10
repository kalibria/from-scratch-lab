import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';
import { lessonProgressStepSchema, submitWritingAttemptSchema } from '@app/shared';
import { db } from '../db/client.js';
import { lessons, lessonProgress, lessonWritingAttempts, grammarTopics } from '../db/schema.js';
import { generateWritingTask } from '../agent/generate-writing-task.js';
import { evaluateWritingTask } from '../agent/evaluate-writing-task.js';
import { flagGrammarMistake } from '../grammar/flag-grammar-mistake.js';

export const lessonsRouter = Router();

async function loadLessonWithTopic(lessonId: number) {
  const [row] = await db
    .select({ lesson: lessons, grammarTopic: grammarTopics })
    .from(lessons)
    .innerJoin(grammarTopics, eq(grammarTopics.id, lessons.grammarTopicId))
    .where(eq(lessons.id, lessonId));

  return row ?? null;
}

function toProgressSummary(progress: typeof lessonProgress.$inferSelect | undefined) {
  return {
    vocabDone: Boolean(progress?.vocabCompletedAt),
    grammarDone: Boolean(progress?.grammarCompletedAt),
    writingDone: Boolean(progress?.writingCompletedAt),
    speakingDone: Boolean(progress?.speakingCompletedAt),
    checkpointDone: Boolean(progress?.checkpointCompletedAt),
    checkpointScore: progress?.checkpointScore ?? null,
  };
}

lessonsRouter.get('/', async (_req, res) => {
  const rows = await db
    .select({ lesson: lessons, progress: lessonProgress })
    .from(lessons)
    .leftJoin(lessonProgress, eq(lessonProgress.lessonId, lessons.id))
    .orderBy(asc(lessons.number));

  res.json(
    rows.map((row) => ({
      id: row.lesson.id,
      number: row.lesson.number,
      title: row.lesson.title,
      sourceBook: row.lesson.sourceBook,
      level: row.lesson.level,
      vocabTheme: row.lesson.vocabTheme,
      progress: toProgressSummary(row.progress ?? undefined),
    })),
  );
});

lessonsRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const [row] = await db
    .select({ lesson: lessons, progress: lessonProgress, grammarTopic: grammarTopics })
    .from(lessons)
    .innerJoin(grammarTopics, eq(grammarTopics.id, lessons.grammarTopicId))
    .leftJoin(lessonProgress, eq(lessonProgress.lessonId, lessons.id))
    .where(eq(lessons.id, id));

  if (!row) {
    return res.status(404).json({ error: 'lesson not found' });
  }

  res.json({
    id: row.lesson.id,
    number: row.lesson.number,
    title: row.lesson.title,
    sourceBook: row.lesson.sourceBook,
    level: row.lesson.level,
    vocabCategory: row.lesson.vocabCategory,
    vocabTheme: row.lesson.vocabTheme,
    grammarTopicId: row.lesson.grammarTopicId,
    grammarTopicName: row.grammarTopic.name,
    speakingPrompt: row.lesson.speakingPrompt,
    progress: toProgressSummary(row.progress ?? undefined),
  });
});

const STEP_COLUMNS = {
  vocab: 'vocabCompletedAt',
  grammar: 'grammarCompletedAt',
  writing: 'writingCompletedAt',
  speaking: 'speakingCompletedAt',
  checkpoint: 'checkpointCompletedAt',
} as const;

lessonsRouter.patch('/:id/progress', async (req, res) => {
  const lessonId = Number(req.params.id);
  const parsed = lessonProgressStepSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { step, score } = parsed.data;
  const now = new Date();
  const column = STEP_COLUMNS[step];

  const update: Partial<typeof lessonProgress.$inferInsert> = { lessonId, [column]: now, updatedAt: now };
  if (step === 'checkpoint' && score !== undefined) {
    update.checkpointScore = score;
  }

  await db
    .insert(lessonProgress)
    .values(update as typeof lessonProgress.$inferInsert)
    .onConflictDoUpdate({ target: lessonProgress.lessonId, set: update });

  res.status(204).end();
});

lessonsRouter.get('/:id/writing-task', async (req, res) => {
  const id = Number(req.params.id);
  const row = await loadLessonWithTopic(id);

  if (!row) {
    return res.status(404).json({ error: 'lesson not found' });
  }

  const prompt = await generateWritingTask(row.lesson.vocabTheme, row.grammarTopic.name, row.grammarTopic.description ?? '');
  res.json({ prompt });
});

lessonsRouter.post('/writing-attempt', async (req, res) => {
  const parsed = submitWritingAttemptSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { sessionId, lessonId, prompt, userAnswer } = parsed.data;
  const row = await loadLessonWithTopic(lessonId);

  if (!row) {
    return res.status(404).json({ error: 'lesson not found' });
  }

  const { verdict, feedback, grammarTopic, suggestedPhrases } = await evaluateWritingTask(
    row.lesson.vocabTheme,
    row.grammarTopic.name,
    prompt,
    userAnswer,
  );

  await flagGrammarMistake(grammarTopic);

  await db.insert(lessonWritingAttempts).values({
    sessionId,
    lessonId,
    prompt,
    userResponse: userAnswer,
    verdict,
    agentFeedback: feedback,
  });

  res.json({ verdict, feedback, suggestedPhrases });
});
