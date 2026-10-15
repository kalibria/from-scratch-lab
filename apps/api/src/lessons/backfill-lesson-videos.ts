import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { lessons } from '../db/schema.js';
import { LESSON_CURRICULUM } from './lesson-curriculum.js';

async function backfillLessonVideos() {
  for (const seed of LESSON_CURRICULUM) {
    const result = await db
      .update(lessons)
      .set({ videoUrl: seed.videoUrl, videoTitle: seed.videoTitle })
      .where(eq(lessons.number, seed.number))
      .returning({ id: lessons.id });

    if (result.length === 0) {
      console.log(`No lesson row found for number ${seed.number} ("${seed.title}") — skipped`);
      continue;
    }

    console.log(`Updated lesson ${seed.number}: ${seed.title}`);
  }
}

backfillLessonVideos()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
