ALTER TABLE "dataset" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "dataset" SET "slug" = lower(regexp_replace(regexp_replace(trim("title"), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));--> statement-breakpoint
ALTER TABLE "dataset" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "dataset" ADD CONSTRAINT "dataset_slug_unique" UNIQUE("slug");