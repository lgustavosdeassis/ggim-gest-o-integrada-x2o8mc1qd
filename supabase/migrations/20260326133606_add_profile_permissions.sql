-- Add new permission columns to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_generate_reports BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allowed_tabs JSONB DEFAULT '[]'::jsonb;

-- Notify PostgREST to reload the schema cache to immediately fix the PGRST204 error
NOTIFY pgrst, 'reload schema';
