CREATE TABLE "recitation_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"recitation_text_id" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recitation_texts" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recitation_turns" (
	"id" serial PRIMARY KEY NOT NULL,
	"recitation_session_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recitation_sessions" ADD CONSTRAINT "recitation_sessions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recitation_sessions" ADD CONSTRAINT "recitation_sessions_recitation_text_id_recitation_texts_id_fk" FOREIGN KEY ("recitation_text_id") REFERENCES "public"."recitation_texts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recitation_turns" ADD CONSTRAINT "recitation_turns_recitation_session_id_recitation_sessions_id_fk" FOREIGN KEY ("recitation_session_id") REFERENCES "public"."recitation_sessions"("id") ON DELETE no action ON UPDATE no action;