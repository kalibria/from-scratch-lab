import { Router } from 'express';
import { analyzeFreeTalkSchema, confirmPhrasesSchema } from '@app/shared';
import { db } from '../db/client.js';
import { freeTalkEntries } from '../db/schema.js';
import { generateFreeTalkPrompt } from '../agent/generate-free-talk-prompt.js';
import { analyzeFreeTalk } from '../agent/analyze-free-talk.js';
import { createPhrasesWithSrs } from '../phrases/create-phrases-with-srs.js';

export const freeTalkRouter = Router();

freeTalkRouter.get('/prompt', async (_req, res) => {
  res.json({ prompt: await generateFreeTalkPrompt() });
});

freeTalkRouter.post('/analyze', async (req, res) => {
  const parsed = analyzeFreeTalkSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { sessionId, promptTopic, userResponse } = parsed.data;
  const analysis = await analyzeFreeTalk(promptTopic, userResponse);

  await db.insert(freeTalkEntries).values({ sessionId, promptTopic, userResponse, analysis });

  res.json(analysis);
});

freeTalkRouter.post('/confirm-phrases', async (req, res) => {
  const parsed = confirmPhrasesSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const created = await createPhrasesWithSrs(
    parsed.data.phrases.map((p) => ({ ...p, source: 'free_talk' as const })),
  );

  res.status(201).json(created);
});
