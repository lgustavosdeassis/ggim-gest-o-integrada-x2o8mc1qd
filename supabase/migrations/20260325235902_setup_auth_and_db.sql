-- 1. Create tables IF NOT EXISTS
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

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obs_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
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

-- 4. Create trigger for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, job_title)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), 'viewer', 'Visualizador')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Seed essential users
DO $$
DECLARE
  admin_id uuid;
  user_id uuid;
BEGIN
  -- gmtengustavo@hotmail.com (Current User)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gmtengustavo@hotmail.com') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (admin_id, '00000000-0000-0000-0000-000000000000', 'gmtengustavo@hotmail.com', crypt('securepassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Gustavo"}', 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
    
    INSERT INTO public.profiles (id, email, name, role, job_title)
    VALUES (admin_id, 'gmtengustavo@hotmail.com', 'Gustavo', 'owner', 'Administrador')
    ON CONFLICT (id) DO UPDATE SET role = 'owner', name = 'Gustavo', job_title = 'Administrador';
  ELSE
    UPDATE public.profiles SET role = 'owner', name = 'Gustavo', job_title = 'Administrador' WHERE email = 'gmtengustavo@hotmail.com';
  END IF;

  -- admin@ggim.foz.br
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@ggim.foz.br') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'admin@ggim.foz.br', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Gestor GGIM"}', 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
    
    INSERT INTO public.profiles (id, email, name, role, job_title)
    VALUES (user_id, 'admin@ggim.foz.br', 'Gestor GGIM', 'owner', 'Proprietário')
    ON CONFLICT (id) DO UPDATE SET role = 'owner', name = 'Gestor GGIM', job_title = 'Proprietário';
  END IF;
END $$;
