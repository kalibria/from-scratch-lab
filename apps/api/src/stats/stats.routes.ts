import { Router } from 'express';
import { isNotNull } from 'drizzle-orm';
import { db } from '../db/client.js';
import { sessions, srsState, agentCalls } from '../db/schema.js';
import { computeStreak } from './compute-streak.js';
import { toDateKey } from '../date-utils.js';

export const statsRouter = Router();

statsRouter.get('/', async (_req, res) => {
  const completed = await db
    .select({ startedAt: sessions.startedAt, endedAt: sessions.endedAt })
    .from(sessions)
    .where(isNotNull(sessions.endedAt));

  const totalMinutes = Math.round(
    completed.reduce((sum, s) => sum + (s.endedAt!.getTime() - s.startedAt.getTime()) / 60000, 0),
  );
  const daysPracticed = new Set(completed.map((s) => toDateKey(s.startedAt))).size;
  const currentStreak = computeStreak(
    completed.map((s) => s.startedAt),
    new Date(),
  );

  const allSrs = await db.select({ box: srsState.box, nextReviewAt: srsState.nextReviewAt }).from(srsState);
  const phrasesTotal = allSrs.length;
  const phrasesMastered = allSrs.filter((s) => s.box === 5).length;
  const phrasesDue = allSrs.filter((s) => s.nextReviewAt <= new Date()).length;

  res.json({
    totalMinutes,
    daysPracticed,
    currentStreak,
    phrasesTotal,
    phrasesMastered,
    phrasesRemaining: phrasesTotal - phrasesMastered,
    phrasesDue,
  });
});

statsRouter.get('/agent', async (_req, res) => {
  const calls = await db.select().from(agentCalls);
  const totalTokens = calls.reduce((sum, c) => sum + (c.promptTokens ?? 0) + (c.completionTokens ?? 0), 0);
  const errorCount = calls.filter((c) => c.status === 'error').length;

  const byFunctionMap = new Map<string, { calls: number; tokens: number; totalLatency: number; errors: number }>();
  for (const c of calls) {
    const entry = byFunctionMap.get(c.functionName) ?? { calls: 0, tokens: 0, totalLatency: 0, errors: 0 };
    entry.calls += 1;
    entry.tokens += (c.promptTokens ?? 0) + (c.completionTokens ?? 0);
    entry.totalLatency += c.latencyMs;
    if (c.status === 'error') entry.errors += 1;
    byFunctionMap.set(c.functionName, entry);
  }

  const byFunction = [...byFunctionMap.entries()].map(([functionName, v]) => ({
    functionName,
    calls: v.calls,
    tokens: v.tokens,
    avgLatencyMs: Math.round(v.totalLatency / v.calls),
    errors: v.errors,
  }));

  res.json({ totalCalls: calls.length, totalTokens, errorCount, byFunction });
});
