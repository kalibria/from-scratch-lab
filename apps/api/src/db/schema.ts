import { pgTable, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const phrases = pgTable('phrases', {
  id: serial('id').primaryKey(),
  enText: text('en_text').notNull(),
  ruGloss: text('ru_gloss'),
  source: text('source').notNull(),
  errorTags: text('error_tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const srsState = pgTable('srs_state', {
  phraseId: integer('phrase_id')
    .references(() => phrases.id)
    .primaryKey(),
  box: integer('box').notNull().default(0),
  intervalDays: integer('interval_days').notNull().default(0),
  nextReviewAt: timestamp('next_review_at').defaultNow().notNull(),
  correctStreak: integer('correct_streak').notNull().default(0),
  lastResult: text('last_result'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  plannedMinutes: integer('planned_minutes').notNull(),
});

export const drillAttempts = pgTable('drill_attempts', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .references(() => sessions.id)
    .notNull(),
  phraseId: integer('phrase_id')
    .references(() => phrases.id)
    .notNull(),
  userAnswer: text('user_answer').notNull(),
  verdict: text('verdict').notNull(),
  agentFeedback: text('agent_feedback'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const freeTalkEntries = pgTable('free_talk_entries', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .references(() => sessions.id)
    .notNull(),
  promptTopic: text('prompt_topic').notNull(),
  userResponse: text('user_response').notNull(),
  analysis: jsonb('analysis'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const agentCalls = pgTable('agent_calls', {
  id: serial('id').primaryKey(),
  functionName: text('function_name').notNull(),
  model: text('model').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
