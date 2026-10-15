CREATE TABLE "lesson_reading_bank" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"text_content" text NOT NULL,
	"opening_question" text NOT NULL,
	"source_url" text,
	"source_title" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_reading_sessions" ADD COLUMN "lesson_reading_bank_id" integer;--> statement-breakpoint
ALTER TABLE "lesson_reading_sessions" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "lesson_reading_sessions" ADD COLUMN "source_title" text;--> statement-breakpoint
ALTER TABLE "lesson_reading_bank" ADD CONSTRAINT "lesson_reading_bank_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_reading_sessions" ADD CONSTRAINT "lesson_reading_sessions_lesson_reading_bank_id_lesson_reading_bank_id_fk" FOREIGN KEY ("lesson_reading_bank_id") REFERENCES "public"."lesson_reading_bank"("id") ON DELETE no action ON UPDATE no action;