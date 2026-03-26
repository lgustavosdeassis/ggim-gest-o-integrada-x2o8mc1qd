-- Add missing columns that might cause the function or frontend to fail
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Re-ensure these columns exist just in case previous migration failed silently
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_generate_reports BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allowed_tabs JSONB;

-- Ensure current admins have the is_admin flag set to true to prevent Unauthorized errors
UPDATE public.profiles SET is_admin = true WHERE role = 'admin';

-- Force Supabase's PostgREST to reload the schema cache to eliminate PGRST204 errors
NOTIFY pgrst, 'reload schema';
