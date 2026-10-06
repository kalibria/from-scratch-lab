CREATE TABLE "lesson_progress" (
	"lesson_id" integer PRIMARY KEY NOT NULL,
	"vocab_completed_at" timestamp,
	"grammar_completed_at" timestamp,
	"writing_completed_at" timestamp,
	"speaking_completed_at" timestamp,
	"checkpoint_completed_at" timestamp,
	"checkpoint_score" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_writing_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"prompt" text NOT NULL,
	"user_response" text NOT NULL,
	"verdict" text NOT NULL,
	"agent_feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"source_book" text NOT NULL,
	"level" text NOT NULL,
	"vocab_category" text NOT NULL,
	"vocab_theme" text NOT NULL,
	"grammar_topic_id" integer NOT NULL,
	"speaking_prompt" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_writing_attempts" ADD CONSTRAINT "lesson_writing_attempts_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_writing_attempts" ADD CONSTRAINT "lesson_writing_attempts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_grammar_topic_id_grammar_topics_id_fk" FOREIGN KEY ("grammar_topic_id") REFERENCES "public"."grammar_topics"("id") ON DELETE no action ON UPDATE no action;