import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { grammarTopics, grammarTopicState } from '../db/schema.js';
import { computeNextSrsState } from '../srs/compute-next-srs-state.js';

export async function flagGrammarMistake(topicName: string | undefined | null): Promise<void> {
  if (!topicName) {
    return;
  }

  const [topic] = await db.select().from(grammarTopics).where(eq(grammarTopics.name, topicName));
  if (!topic) {
    return;
  }

  const [state] = await db.select().from(grammarTopicState).where(eq(grammarTopicState.topicId, topic.id));
  if (!state) {
    return;
  }

  const nextState = computeNextSrsState(state, 'incorrect', new Date());
  await db.update(grammarTopicState).set(nextState).where(eq(grammarTopicState.topicId, topic.id));
}
