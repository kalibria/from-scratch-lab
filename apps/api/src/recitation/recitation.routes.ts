import { Router } from 'express';
import { asc, eq, sql, type SQL } from 'drizzle-orm';
import { generateRecitationTextSchema, startRecitationSessionSchema, submitRecitationTurnSchema } from '@app/shared';
import { db } from '../db/client.js';
import { phrases, recitationSessions, recitationTexts, recitationTurns } from '../db/schema.js';
import { generateRecitationText } from '../agent/generate-recitation-text.js';
import { converseRecitation, type ConversationTurn } from '../agent/converse-recitation.js';
import { flagGrammarMistake } from '../grammar/flag-grammar-mistake.js';

export const recitationRouter = Router();

const PRESET_TOPICS = [
  'giving a standup update to the team',
  'small talk with a colleague before a meeting',
  'giving a status update to your manager',
  'asking a colleague for help with something',
];

const PHRASE_SAMPLE_SIZE = 8;
const MAX_ASSISTANT_TURNS = 4;

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function samplePhrases(category: string | undefined): Promise<string[]> {
  const condition: SQL | undefined = category ? eq(phrases.category, category) : undefined;

  const rows = await db
    .select({ enText: phrases.enText })
    .from(phrases)
    .where(condition)
    .orderBy(sql`random()`)
    .limit(PHRASE_SAMPLE_SIZE);

  return rows.map((row) => row.enText);
}

recitationRouter.post('/generate', async (req, res) => {
  const parsed = generateRecitationTextSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const topic = parsed.data.topic ?? pickRandom(PRESET_TOPICS);
  const phraseSample = await samplePhrases(parsed.data.category);
  const { text } = await generateRecitationText(topic, phraseSample);

  const [row] = await db
    .insert(recitationTexts)
    .values({ topic, content: text, category: parsed.data.category })
    .returning();

  res.status(201).json(row);
});

recitationRouter.post('/start', async (req, res) => {
  const parsed = startRecitationSessionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [row] = await db
    .insert(recitationSessions)
    .values({ sessionId: parsed.data.sessionId, recitationTextId: parsed.data.recitationTextId })
    .returning();

  res.status(201).json(row);
});

recitationRouter.post('/turn', async (req, res) => {
  const parsed = submitRecitationTurnSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { recitationSessionId, userUtterance } = parsed.data;

  const [session] = await db.select().from(recitationSessions).where(eq(recitationSessions.id, recitationSessionId));
  if (!session) {
    return res.status(404).json({ error: 'recitation session not found' });
  }
  if (session.status === 'done') {
    return res.status(409).json({ error: 'recitation session already finished' });
  }

  const [text] = await db.select().from(recitationTexts).where(eq(recitationTexts.id, session.recitationTextId));
  const priorTurns = await db
    .select({ role: recitationTurns.role, content: recitationTurns.content })
    .from(recitationTurns)
    .where(eq(recitationTurns.recitationSessionId, recitationSessionId))
    .orderBy(asc(recitationTurns.createdAt));

  const history = priorTurns as ConversationTurn[];
  const assistantTurnsSoFar = history.filter((turn) => turn.role === 'assistant').length;
  const isFinalTurn = assistantTurnsSoFar + 1 >= MAX_ASSISTANT_TURNS;

  const result = await converseRecitation(text.content, history, userUtterance, isFinalTurn);

  for (const correction of result.corrections) {
    await flagGrammarMistake(correction.topic);
  }

  await db.transaction(async (tx) => {
    await tx.insert(recitationTurns).values({ recitationSessionId, role: 'user', content: userUtterance });
    await tx.insert(recitationTurns).values({ recitationSessionId, role: 'assistant', content: result.reply });

    if (result.done) {
      await tx.update(recitationSessions).set({ status: 'done' }).where(eq(recitationSessions.id, recitationSessionId));
    }
  });

  res.json(result);
});
