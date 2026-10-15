import 'dotenv/config';
import { count, eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { lessons, phrases, lessonReadingBank } from '../db/schema.js';
import { generateLessonReadingBatch } from '../agent/generate-lesson-reading-batch.js';
import { LESSON_CURRICULUM } from './lesson-curriculum.js';
import { LESSON_READING_SOURCES } from './lesson-reading-sources.js';

const TARGET_PER_LESSON = 10;
const PHRASE_SAMPLE_SIZE = 8;
const MAX_PASSAGES_PER_CALL = 5;
const DELAY_BETWEEN_CALLS_MS = 5000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sampleLessonVocab(vocabCategory: string): Promise<string[]> {
  const rows = await db
    .select({ enText: phrases.enText })
    .from(phrases)
    .where(eq(phrases.category, vocabCategory))
    .orderBy(sql`random()`)
    .limit(PHRASE_SAMPLE_SIZE);

  return rows.map((row) => row.enText);
}

async function seedLessonReadingBank() {
  for (const seed of LESSON_CURRICULUM) {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.number, seed.number));

    if (!lesson) {
      console.log(`Skipping lesson ${seed.number} — not found in lessons table`);
      continue;
    }

    const source = LESSON_READING_SOURCES[seed.number];

    if (!source) {
      console.log(`Skipping lesson ${seed.number} — no source article curated`);
      continue;
    }

    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(lessonReadingBank)
      .where(eq(lessonReadingBank.lessonId, lesson.id));

    const needed = TARGET_PER_LESSON - existingCount;

    if (needed <= 0) {
      console.log(`Skipping lesson ${seed.number} — already has ${existingCount} passages`);
      continue;
    }

    try {
      const vocab = await sampleLessonVocab(seed.vocabCategory);
      let totalInserted = 0;
      let remaining = needed;

      while (remaining > 0) {
        const chunkSize = Math.min(MAX_PASSAGES_PER_CALL, remaining);
        const passages = await generateLessonReadingBatch(
          seed.vocabTheme,
          seed.level,
          vocab,
          source.title,
          source.summary,
          chunkSize,
        );

        await db.insert(lessonReadingBank).values(
          passages.map((passage) => ({
            lessonId: lesson.id,
            textContent: passage.text,
            openingQuestion: passage.openingQuestion,
            sourceUrl: source.url,
            sourceTitle: source.title,
          })),
        );

        totalInserted += passages.length;
        remaining -= chunkSize;

        if (remaining > 0) {
          await sleep(DELAY_BETWEEN_CALLS_MS);
        }
      }

      await sleep(DELAY_BETWEEN_CALLS_MS);

      console.log(`Seeded lesson ${seed.number}: +${totalInserted} reading passages (had ${existingCount})`);
    } catch (error) {
      console.error(`Failed to seed lesson ${seed.number} ("${seed.title}"):`, error);
    }
  }
}

seedLessonReadingBank()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
