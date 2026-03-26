-- Add descending indexes to optimize ORDER BY queries and prevent statement timeouts
-- during paginated data fetching.

CREATE INDEX IF NOT EXISTS idx_activities_created_at_desc ON public.activities (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ggim_reports_created_at_desc ON public.ggim_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_desc ON public.audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_video_records_date_desc ON public.video_records (date DESC);
CREATE INDEX IF NOT EXISTS idx_obs_records_date_desc ON public.obs_records (date DESC);
