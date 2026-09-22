CREATE TABLE "grammar_exercise_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	"exercise_prompt" text NOT NULL,
	"user_answer" text NOT NULL,
	"verdict" text NOT NULL,
	"agent_feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_topic_state" (
	"topic_id" integer PRIMARY KEY NOT NULL,
	"box" integer DEFAULT 0 NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"next_review_at" timestamp DEFAULT now() NOT NULL,
	"correct_streak" integer DEFAULT 0 NOT NULL,
	"fail_streak" integer DEFAULT 0 NOT NULL,
	"last_result" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grammar_exercise_attempts" ADD CONSTRAINT "grammar_exercise_attempts_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_exercise_attempts" ADD CONSTRAINT "grammar_exercise_attempts_topic_id_grammar_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."grammar_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_topic_state" ADD CONSTRAINT "grammar_topic_state_topic_id_grammar_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."grammar_topics"("id") ON DELETE no action ON UPDATE no action;