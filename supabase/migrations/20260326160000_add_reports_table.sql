ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_delete_reports BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS public.ggim_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  period_year INTEGER NOT NULL,
  period_month INTEGER,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ggim_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_reports" ON public.ggim_reports;
CREATE POLICY "allow_all_reports" ON public.ggim_reports FOR ALL USING (true);
