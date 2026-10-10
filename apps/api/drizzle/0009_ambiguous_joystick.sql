CREATE TABLE "grammar_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer NOT NULL,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"correct_answer" text,
	"level" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grammar_exercise_attempts" ADD COLUMN "exercise_id" integer;--> statement-breakpoint
ALTER TABLE "grammar_exercises" ADD CONSTRAINT "grammar_exercises_topic_id_grammar_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."grammar_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_exercise_attempts" ADD CONSTRAINT "grammar_exercise_attempts_exercise_id_grammar_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."grammar_exercises"("id") ON DELETE no action ON UPDATE no action;