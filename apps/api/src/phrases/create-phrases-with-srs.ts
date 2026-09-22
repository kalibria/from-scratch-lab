import type { CreatePhraseInput } from '@app/shared';
import { db } from '../db/client.js';
import { createPhraseWithSrs } from './create-phrase-with-srs.js';

export async function createPhrasesWithSrs(inputs: CreatePhraseInput[]) {
  return db.transaction(async (tx) => {
    const rows = [];
    for (const input of inputs) {
      const created = await createPhraseWithSrs(tx, input);
      if (created) {
        rows.push(created);
      }
    }
    return rows;
  });
}
