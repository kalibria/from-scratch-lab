CREATE TABLE "agent_calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"function_name" text NOT NULL,
	"model" text NOT NULL,
	"latency_ms" integer NOT NULL,
	"prompt_tokens" integer,
	"completion_tokens" integer,
	"status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
