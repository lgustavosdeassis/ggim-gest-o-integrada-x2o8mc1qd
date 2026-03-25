-- Create initial schema for GGIM data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  job_title TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT,
  instance TEXT NOT NULL,
  event_type TEXT NOT NULL,
  modality TEXT NOT NULL,
  location TEXT NOT NULL,
  meeting_start TIMESTAMPTZ NOT NULL,
  meeting_end TIMESTAMPTZ NOT NULL,
  has_additional_days BOOLEAN DEFAULT false,
  additional_days JSONB DEFAULT '[]'::jsonb,
  has_action BOOLEAN DEFAULT false,
  action_start TIMESTAMPTZ,
  action_end TIMESTAMPTZ,
  actions JSONB DEFAULT '[]'::jsonb,
  participants_pf TEXT,
  participants_pj TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  deliberations TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.video_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  particulares INT DEFAULT 0,
  instituicoes INT DEFAULT 0,
  imprensa INT DEFAULT 0,
  operadores INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.obs_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  sinistros_vitimas INT DEFAULT 0,
  sinistros_total INT DEFAULT 0,
  autos_infracao INT DEFAULT 0,
  homicidios INT DEFAULT 0,
  violencia_domestica INT DEFAULT 0,
  roubos INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT,
  user_email TEXT,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obs_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_profiles" ON public.profiles;
CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all_activities" ON public.activities;
CREATE POLICY "allow_all_activities" ON public.activities FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all_video" ON public.video_records;
CREATE POLICY "allow_all_video" ON public.video_records FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all_obs" ON public.obs_records;
CREATE POLICY "allow_all_obs" ON public.obs_records FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all_audit" ON public.audit_logs;
CREATE POLICY "allow_all_audit" ON public.audit_logs FOR ALL USING (true);

DO $$
DECLARE
  admin_id uuid;
  editor_id uuid;
  viewer_id uuid;
BEGIN
  -- admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@ggim.foz.br') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (admin_id, '00000000-0000-0000-0000-000000000000', 'admin@ggim.foz.br', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
    
    INSERT INTO public.profiles (id, email, name, role, job_title)
    VALUES (admin_id, 'admin@ggim.foz.br', 'Gestor GGIM', 'owner', 'Proprietário')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- editor
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'editor@ggim.foz.br') THEN
    editor_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (editor_id, '00000000-0000-0000-0000-000000000000', 'editor@ggim.foz.br', crypt('editor123', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
    
    INSERT INTO public.profiles (id, email, name, role, job_title)
    VALUES (editor_id, 'editor@ggim.foz.br', 'Editor GGIM', 'editor', 'Editor')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- viewer
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'viewer@ggim.foz.br') THEN
    viewer_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (viewer_id, '00000000-0000-0000-0000-000000000000', 'viewer@ggim.foz.br', crypt('viewer123', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
    
    INSERT INTO public.profiles (id, email, name, role, job_title)
    VALUES (viewer_id, 'viewer@ggim.foz.br', 'Visualizador GGIM', 'viewer', 'Visualizador')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- default skip user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gmtengustavo@hotmail.com') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (admin_id, '00000000-0000-0000-0000-000000000000', 'gmtengustavo@hotmail.com', crypt('securepassword123', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
    
    INSERT INTO public.profiles (id, email, name, role, job_title)
    VALUES (admin_id, 'gmtengustavo@hotmail.com', 'Gustavo', 'owner', 'Administrador')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
