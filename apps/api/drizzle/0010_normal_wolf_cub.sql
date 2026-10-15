CREATE TABLE "lesson_reading_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"text_content" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_reading_turns" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_reading_session_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN "reading_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN "video_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "video_title" text;--> statement-breakpoint
ALTER TABLE "lesson_reading_sessions" ADD CONSTRAINT "lesson_reading_sessions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_reading_sessions" ADD CONSTRAINT "lesson_reading_sessions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_reading_turns" ADD CONSTRAINT "lesson_reading_turns_lesson_reading_session_id_lesson_reading_sessions_id_fk" FOREIGN KEY ("lesson_reading_session_id") REFERENCES "public"."lesson_reading_sessions"("id") ON DELETE no action ON UPDATE no action;