-- Guardrails: usage metering + cost-control settings
-- Every billable action (generation start, AI inference call, deploy/publish,
-- generated-app request) is recorded here so spend is always visible and
-- enforceable. Caps live in system_settings so they can be changed at runtime
-- without a redeploy; env vars act as bootstrap defaults.

CREATE TABLE `usage_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`app_id` text,
	`kind` text NOT NULL,
	`units` integer DEFAULT 1 NOT NULL,
	`day` text NOT NULL,
	`meta` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `usage_events_day_kind_idx` ON `usage_events` (`day`,`kind`);
--> statement-breakpoint
CREATE INDEX `usage_events_user_day_kind_idx` ON `usage_events` (`user_id`,`day`,`kind`);
--> statement-breakpoint
CREATE INDEX `usage_events_app_day_idx` ON `usage_events` (`app_id`,`day`);
--> statement-breakpoint
INSERT OR IGNORE INTO `system_settings` (`id`, `key`, `value`, `description`) VALUES
	('guardrails-generation-enabled', 'guardrails.generation_enabled', 'true', 'Master kill switch for code generation and deploys. Set to false to stop all generation/deploy activity immediately.'),
	('guardrails-user-daily-generations', 'guardrails.user_daily_generations', '2', 'Max generation sessions one user may start per UTC day.'),
	('guardrails-global-daily-generations', 'guardrails.global_daily_generations', '5', 'Max generation sessions across all users per UTC day. Sized so worst-case sandbox container usage stays inside the Workers Paid included amounts.'),
	('guardrails-user-max-apps', 'guardrails.user_max_apps', '5', 'Max total apps a single user may own.'),
	('guardrails-global-max-deployed-apps', 'guardrails.global_max_deployed_apps', '25', 'Max simultaneously published (deployed) apps across the platform.'),
	('guardrails-global-daily-ai-calls', 'guardrails.global_daily_ai_calls', '1500', 'Max AI inference calls across all users per UTC day.'),
	('guardrails-agent-max-ai-calls', 'guardrails.agent_max_ai_calls', '300', 'Max AI inference calls inside a single generation session (runaway-agent brake).'),
	('guardrails-app-daily-request-cap', 'guardrails.app_daily_request_cap', '5000', 'Max requests served to one published app per UTC day.'),
	('guardrails-global-daily-app-requests', 'guardrails.global_daily_app_requests', '50000', 'Max requests served to all published apps per UTC day.');

--> statement-breakpoint
ALTER TABLE `apps` ADD COLUMN `slug` text;
--> statement-breakpoint
ALTER TABLE `apps` ADD COLUMN `deployment_url` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `apps_slug_idx` ON `apps` (`slug`);
