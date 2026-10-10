import 'dotenv/config';
import { count, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { grammarTopics, grammarExercises } from '../db/schema.js';
import { generateGrammarExerciseBatch } from '../agent/generate-grammar-exercise-batch.js';
import { CEFR_TOPICS } from './cefr-topics.js';

const TARGET_PER_TOPIC = 25;

async function seedGrammarExercises() {
  for (const cefrTopic of CEFR_TOPICS) {
    const [topic] = await db.select().from(grammarTopics).where(eq(grammarTopics.name, cefrTopic.name));

    if (!topic) {
      console.log(`Skipping "${cefrTopic.name}" — no matching grammar_topics row`);
      continue;
    }

    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(grammarExercises)
      .where(eq(grammarExercises.topicId, topic.id));

    const needed = TARGET_PER_TOPIC - existingCount;

    if (needed <= 0) {
      console.log(`Skipping "${cefrTopic.name}" — already has ${existingCount} exercises`);
      continue;
    }

    const batch = await generateGrammarExerciseBatch(cefrTopic.name, cefrTopic.description, needed);

    await db.insert(grammarExercises).values(
      batch.map((exercise) => ({
        topicId: topic.id,
        type: exercise.type,
        prompt: exercise.prompt,
        correctAnswer: exercise.type === 'closed' ? (exercise.correctAnswer ?? null) : null,
        level: cefrTopic.level,
      })),
    );

    console.log(`Seeded "${cefrTopic.name}": +${batch.length} exercises (had ${existingCount})`);
  }
}

seedGrammarExercises()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
