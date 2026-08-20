import type { CreatePhraseInput } from '@app/shared';
import { db } from '../db/client.js';
import { phrases, srsState } from '../db/schema.js';

type TxLike = { insert: typeof db.insert };

export async function createPhraseWithSrs(tx: TxLike, input: CreatePhraseInput) {
  const [phrase] = await tx.insert(phrases).values(input).returning();
  await tx.insert(srsState).values({ phraseId: phrase.id });
  return phrase;
}
