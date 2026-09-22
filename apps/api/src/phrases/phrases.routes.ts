import { Router } from 'express';
import { isNotNull } from 'drizzle-orm';
import { createPhraseSchema, extractPhrasesRequestSchema, bulkAddPhrasesSchema } from '@app/shared';
import { db } from '../db/client.js';
import { phrases } from '../db/schema.js';
import { createPhraseWithSrs } from './create-phrase-with-srs.js';
import { createPhrasesWithSrs } from './create-phrases-with-srs.js';
import { extractPhrases } from '../agent/extract-phrases.js';

export const phrasesRouter = Router();

phrasesRouter.post('/', async (req, res) => {
  const parsed = createPhraseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const phrase = await db.transaction((tx) => createPhraseWithSrs(tx, parsed.data));

  if (!phrase) {
    return res.status(409).json({ error: 'phrase already exists' });
  }

  res.status(201).json(phrase);
});

phrasesRouter.get('/', async (_req, res) => {
  res.json(await db.select().from(phrases));
});

phrasesRouter.get('/categories', async (_req, res) => {
  const rows = await db
    .selectDistinct({ category: phrases.category })
    .from(phrases)
    .where(isNotNull(phrases.category));

  res.json(rows.map((row) => row.category));
});

phrasesRouter.post('/extract', async (req, res) => {
  const parsed = extractPhrasesRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  res.json({ phrases: await extractPhrases(parsed.data.text) });
});

phrasesRouter.post('/bulk', async (req, res) => {
  const parsed = bulkAddPhrasesSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const created = await createPhrasesWithSrs(
    parsed.data.phrases.map((p) => ({ ...p, source: 'manual' as const, category: parsed.data.category })),
  );
  res.status(201).json(created);
});
