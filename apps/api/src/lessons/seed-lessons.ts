import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { lessons, grammarTopics } from '../db/schema.js';
import { createPhrasesWithSrs } from '../phrases/create-phrases-with-srs.js';
import { generateLessonVocab } from '../agent/generate-lesson-vocab.js';
import { LESSON_CURRICULUM } from './lesson-curriculum.js';

async function seedLessons() {
  const existingRows = await db.select({ number: lessons.number }).from(lessons);
  const existingNumbers = new Set(existingRows.map((row) => row.number));

  for (const seed of LESSON_CURRICULUM) {
    if (existingNumbers.has(seed.number)) {
      console.log(`Skipping lesson ${seed.number} (already seeded)`);
      continue;
    }

    const [topic] = await db.select().from(grammarTopics).where(eq(grammarTopics.name, seed.grammarTopicName));
    if (!topic) {
      throw new Error(`Grammar topic not found: "${seed.grammarTopicName}" (run the CEFR topic seed first)`);
    }

    await db.insert(lessons).values({
      number: seed.number,
      title: seed.title,
      sourceBook: seed.sourceBook,
      level: seed.level,
      vocabCategory: seed.vocabCategory,
      vocabTheme: seed.vocabTheme,
      grammarTopicId: topic.id,
      speakingPrompt: seed.speakingPrompt,
    });

    const vocab = await generateLessonVocab(seed.vocabTheme, seed.level);
    await createPhrasesWithSrs(
      vocab.map((phrase) => ({ ...phrase, source: 'lesson_seed' as const, category: seed.vocabCategory })),
    );

    console.log(`Seeded lesson ${seed.number}: ${seed.title} (+${vocab.length} phrases)`);
  }
}

seedLessons()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
