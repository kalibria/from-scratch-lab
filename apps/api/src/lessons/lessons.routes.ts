import { Router } from 'express';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import {
  lessonProgressStepSchema,
  submitWritingAttemptSchema,
  startLessonReadingSchema,
  submitLessonReadingTurnSchema,
  submitLessonVideoReflectionSchema,
} from '@app/shared';
import { db } from '../db/client.js';
import {
  lessons,
  lessonProgress,
  lessonWritingAttempts,
  lessonReadingBank,
  lessonReadingSessions,
  lessonReadingTurns,
  grammarTopics,
  phrases,
} from '../db/schema.js';
import { generateWritingTask } from '../agent/generate-writing-task.js';
import { evaluateWritingTask } from '../agent/evaluate-writing-task.js';
import { generateLessonReading } from '../agent/generate-lesson-reading.js';
import { discussLessonReading, type ConversationTurn } from '../agent/discuss-lesson-reading.js';
import { extractPhrases } from '../agent/extract-phrases.js';
import { flagGrammarMistake } from '../grammar/flag-grammar-mistake.js';

export const lessonsRouter = Router();

const READING_PHRASE_SAMPLE_SIZE = 8;

async function loadLessonWithTopic(lessonId: number) {
  const [row] = await db
    .select({ lesson: lessons, grammarTopic: grammarTopics })
    .from(lessons)
    .innerJoin(grammarTopics, eq(grammarTopics.id, lessons.grammarTopicId))
    .where(eq(lessons.id, lessonId));

  return row ?? null;
}

async function sampleLessonVocab(vocabCategory: string): Promise<string[]> {
  const rows = await db
    .select({ enText: phrases.enText })
    .from(phrases)
    .where(eq(phrases.category, vocabCategory))
    .orderBy(sql`random()`)
    .limit(READING_PHRASE_SAMPLE_SIZE);

  return rows.map((row) => row.enText);
}

async function selectUnseenReadingBankEntry(lessonId: number) {
  const [row] = await db
    .select({ entry: lessonReadingBank })
    .from(lessonReadingBank)
    .leftJoin(lessonReadingSessions, eq(lessonReadingSessions.lessonReadingBankId, lessonReadingBank.id))
    .where(and(eq(lessonReadingBank.lessonId, lessonId), isNull(lessonReadingSessions.id)))
    .orderBy(sql`random()`)
    .limit(1);

  return row?.entry ?? null;
}

async function selectLeastRecentlyUsedReadingBankEntry(lessonId: number) {
  const lastUsedAt = sql<string>`max(${lessonReadingSessions.createdAt})`;

  const [row] = await db
    .select({ entry: lessonReadingBank, lastUsedAt })
    .from(lessonReadingBank)
    .innerJoin(lessonReadingSessions, eq(lessonReadingSessions.lessonReadingBankId, lessonReadingBank.id))
    .where(eq(lessonReadingBank.lessonId, lessonId))
    .groupBy(lessonReadingBank.id)
    .orderBy(asc(lastUsedAt))
    .limit(1);

  return row?.entry ?? null;
}

async function selectReadingBankEntry(lessonId: number) {
  return (await selectUnseenReadingBankEntry(lessonId)) ?? (await selectLeastRecentlyUsedReadingBankEntry(lessonId));
}

function toProgressSummary(progress: typeof lessonProgress.$inferSelect | undefined) {
  return {
    vocabDone: Boolean(progress?.vocabCompletedAt),
    grammarDone: Boolean(progress?.grammarCompletedAt),
    writingDone: Boolean(progress?.writingCompletedAt),
    speakingDone: Boolean(progress?.speakingCompletedAt),
    readingDone: Boolean(progress?.readingCompletedAt),
    videoDone: Boolean(progress?.videoCompletedAt),
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
    videoUrl: row.lesson.videoUrl,
    videoTitle: row.lesson.videoTitle,
    progress: toProgressSummary(row.progress ?? undefined),
  });
});

const STEP_COLUMNS = {
  vocab: 'vocabCompletedAt',
  grammar: 'grammarCompletedAt',
  writing: 'writingCompletedAt',
  speaking: 'speakingCompletedAt',
  reading: 'readingCompletedAt',
  video: 'videoCompletedAt',
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

lessonsRouter.post('/:id/reading/start', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = startLessonReadingSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const row = await loadLessonWithTopic(id);
  if (!row) {
    return res.status(404).json({ error: 'lesson not found' });
  }

  const bankEntry = await selectReadingBankEntry(id);

  let textContent: string;
  let openingQuestion: string;
  let sourceUrl: string | null = null;
  let sourceTitle: string | null = null;
  let lessonReadingBankId: number | null = null;

  if (bankEntry) {
    textContent = bankEntry.textContent;
    openingQuestion = bankEntry.openingQuestion;
    sourceUrl = bankEntry.sourceUrl;
    sourceTitle = bankEntry.sourceTitle;
    lessonReadingBankId = bankEntry.id;
  } else {
    const vocab = await sampleLessonVocab(row.lesson.vocabCategory);
    const generated = await generateLessonReading(row.lesson.vocabTheme, row.lesson.level, vocab);
    textContent = generated.text;
    openingQuestion = generated.openingQuestion;
  }

  const [readingSession] = await db
    .insert(lessonReadingSessions)
    .values({
      sessionId: parsed.data.sessionId,
      lessonId: id,
      lessonReadingBankId,
      textContent,
      sourceUrl,
      sourceTitle,
    })
    .returning();

  await db.insert(lessonReadingTurns).values({
    lessonReadingSessionId: readingSession.id,
    role: 'assistant',
    content: openingQuestion,
  });

  res.status(201).json({ id: readingSession.id, textContent, openingQuestion, sourceUrl, sourceTitle });
});

lessonsRouter.post('/reading-turn', async (req, res) => {
  const parsed = submitLessonReadingTurnSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { lessonReadingSessionId, userUtterance } = parsed.data;

  const [readingSession] = await db
    .select()
    .from(lessonReadingSessions)
    .where(eq(lessonReadingSessions.id, lessonReadingSessionId));

  if (!readingSession) {
    return res.status(404).json({ error: 'reading session not found' });
  }
  if (readingSession.status === 'done') {
    return res.status(409).json({ error: 'reading discussion already finished' });
  }

  const priorTurns = await db
    .select({ role: lessonReadingTurns.role, content: lessonReadingTurns.content })
    .from(lessonReadingTurns)
    .where(eq(lessonReadingTurns.lessonReadingSessionId, lessonReadingSessionId))
    .orderBy(asc(lessonReadingTurns.createdAt));

  const history = priorTurns as ConversationTurn[];
  const result = await discussLessonReading(readingSession.textContent, history, userUtterance);

  for (const correction of result.corrections) {
    await flagGrammarMistake(correction.topic);
  }

  await db.transaction(async (tx) => {
    await tx.insert(lessonReadingTurns).values({ lessonReadingSessionId, role: 'user', content: userUtterance });
    await tx.insert(lessonReadingTurns).values({ lessonReadingSessionId, role: 'assistant', content: result.reply });

    if (result.done) {
      await tx
        .update(lessonReadingSessions)
        .set({ status: 'done' })
        .where(eq(lessonReadingSessions.id, lessonReadingSessionId));
    }
  });

  res.json(result);
});

lessonsRouter.post('/video-reflection', async (req, res) => {
  const parsed = submitLessonVideoReflectionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const phrases = await extractPhrases(parsed.data.reflection);

  res.json({ phrases });
});
