CREATE TABLE `practice_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`role_id` text NOT NULL,
	`role_title` text NOT NULL,
	`date` text NOT NULL,
	`mode` text NOT NULL,
	`score` integer NOT NULL,
	`content` integer NOT NULL,
	`clarity` integer NOT NULL,
	`confidence` integer,
	`completed` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_owner_date` ON `practice_sessions` (`owner`,`date`);