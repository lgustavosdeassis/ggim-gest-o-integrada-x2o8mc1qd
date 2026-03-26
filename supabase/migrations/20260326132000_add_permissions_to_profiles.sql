ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS allowed_tabs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS can_generate_reports BOOLEAN DEFAULT false;

NOTIFY pgrst, 'reload schema';
