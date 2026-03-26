-- Add the new permission columns to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_generate_reports BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allowed_tabs JSONB DEFAULT '[]'::jsonb;

-- Update the handle_new_user trigger to include the new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, job_title, can_generate_reports, allowed_tabs)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), 
    'viewer', 
    'Visualizador',
    false,
    '[]'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force schema cache reload for PostgREST to immediately fix the PGRST204 error
NOTIFY pgrst, 'reload schema';
