CREATE TYPE "public"."file_status" AS ENUM('draft', 'in_circulation', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."department" AS ENUM('ict', 'dg', 'hr');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'admin');--> statement-breakpoint
CREATE TYPE "public"."sub_role" AS ENUM('head', 'manager', 'employee');--> statement-breakpoint
CREATE TYPE "public"."step_status" AS ENUM('pending', 'approved', 'returned');--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "file_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"file_id" uuid,
	"from_department_id" uuid,
	"to_department_id" uuid,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"creator_id" uuid NOT NULL,
	"origin_department_id" uuid,
	"file_url" text NOT NULL,
	"status" "file_status" DEFAULT 'draft',
	"current_department_id" uuid NOT NULL,
	"current_step_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role" DEFAULT 'admin' NOT NULL,
	"department" "department" DEFAULT 'ict' NOT NULL,
	"department_id" uuid,
	"sub_role" "sub_role" DEFAULT 'employee' NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid,
	"department_id" uuid,
	"status" "step_status" DEFAULT 'pending' NOT NULL,
	"step_order" integer NOT NULL,
	"comments" text,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"department" text NOT NULL,
	"position" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file_logs" ADD CONSTRAINT "file_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_logs" ADD CONSTRAINT "file_logs_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_logs" ADD CONSTRAINT "file_logs_from_department_id_departments_id_fk" FOREIGN KEY ("from_department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_logs" ADD CONSTRAINT "file_logs_to_department_id_departments_id_fk" FOREIGN KEY ("to_department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_origin_department_id_departments_id_fk" FOREIGN KEY ("origin_department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_current_department_id_departments_id_fk" FOREIGN KEY ("current_department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_current_step_id_workflows_id_fk" FOREIGN KEY ("current_step_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;