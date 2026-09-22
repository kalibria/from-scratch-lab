import { Router } from 'express';
import { extractPhrases } from '../agent/extract-phrases.js';
import { createPhrasesWithSrs } from '../phrases/create-phrases-with-srs.js';
import { toDateKey } from '../date-utils.js';

export const telegramRouter = Router();

function buildBlockCategory(now: Date): string {
  const time = now.toISOString().slice(11, 19).replace(/:/g, '');
  return `telegram-${toDateKey(now)}-${time}`;
}

telegramRouter.post('/webhook', async (req, res) => {
  if (req.get('X-Telegram-Bot-Api-Secret-Token') !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(401).end();
  }

  const text = req.body?.message?.text ?? req.body?.channel_post?.text;

  if (!text) {
    return res.status(200).end();
  }

  try {
    const extracted = await extractPhrases(text);

    if (extracted.length > 0) {
      const category = buildBlockCategory(new Date());
      await createPhrasesWithSrs(
        extracted.map((phrase) => ({ ...phrase, source: 'telegram' as const, category })),
      );
    }
  } catch (error) {
    console.error('Failed to process Telegram webhook message', error);
  }

  res.status(200).end();
});
