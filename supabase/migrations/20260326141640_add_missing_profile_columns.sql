ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS can_generate_reports BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allowed_tabs JSONB DEFAULT '[]'::jsonb;

UPDATE public.profiles SET is_admin = true WHERE role IN ('admin', 'owner');

NOTIFY pgrst, 'reload schema';
