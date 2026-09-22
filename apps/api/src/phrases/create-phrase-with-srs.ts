import { sql } from 'drizzle-orm';
import type { CreatePhraseInput } from '@app/shared';
import { db } from '../db/client.js';
import { phrases, srsState } from '../db/schema.js';

type TxLike = { insert: typeof db.insert; select: typeof db.select };

export async function createPhraseWithSrs(tx: TxLike, input: CreatePhraseInput) {
  const [existing] = await tx
    .select({ id: phrases.id })
    .from(phrases)
    .where(sql`lower(${phrases.enText}) = lower(${input.enText})`)
    .limit(1);

  if (existing) {
    return null;
  }

  const [phrase] = await tx.insert(phrases).values(input).returning();
  await tx.insert(srsState).values({ phraseId: phrase.id });
  return phrase;
}
