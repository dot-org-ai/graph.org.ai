CREATE TABLE `relationships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from` text NOT NULL,
	`predicate` text NOT NULL,
	`reverse` text,
	`to` text NOT NULL,
	`meta` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `searches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`text` text NOT NULL,
	`embedding` blob,
	`meta` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `things` (
	`ns` text NOT NULL,
	`type` text NOT NULL,
	`id` text NOT NULL,
	`url` text PRIMARY KEY NOT NULL,
	`data` text,
	`code` text,
	`content` text,
	`meta` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
