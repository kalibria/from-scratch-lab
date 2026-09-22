import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

export const phrases = pgTable('phrases', {
  id: serial('id').primaryKey(),
  enText: text('en_text').notNull(),
  ruGloss: text('ru_gloss'),
  usageNote: text('usage_note'),
  category: text('category'),
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
  failStreak: integer('fail_streak').notNull().default(0),
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
  wasNew: boolean('was_new').notNull().default(false),
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

export const recitationTexts = pgTable('recitation_texts', {
  id: serial('id').primaryKey(),
  topic: text('topic').notNull(),
  content: text('content').notNull(),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const recitationSessions = pgTable('recitation_sessions', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .references(() => sessions.id)
    .notNull(),
  recitationTextId: integer('recitation_text_id')
    .references(() => recitationTexts.id)
    .notNull(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const recitationTurns = pgTable('recitation_turns', {
  id: serial('id').primaryKey(),
  recitationSessionId: integer('recitation_session_id')
    .references(() => recitationSessions.id)
    .notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const grammarTopics = pgTable('grammar_topics', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  level: text('level').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const grammarTopicState = pgTable('grammar_topic_state', {
  topicId: integer('topic_id')
    .references(() => grammarTopics.id)
    .primaryKey(),
  box: integer('box').notNull().default(0),
  intervalDays: integer('interval_days').notNull().default(0),
  nextReviewAt: timestamp('next_review_at').defaultNow().notNull(),
  correctStreak: integer('correct_streak').notNull().default(0),
  failStreak: integer('fail_streak').notNull().default(0),
  lastResult: text('last_result'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const grammarExerciseAttempts = pgTable('grammar_exercise_attempts', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .references(() => sessions.id)
    .notNull(),
  topicId: integer('topic_id')
    .references(() => grammarTopics.id)
    .notNull(),
  exercisePrompt: text('exercise_prompt').notNull(),
  userAnswer: text('user_answer').notNull(),
  verdict: text('verdict').notNull(),
  agentFeedback: text('agent_feedback'),
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
