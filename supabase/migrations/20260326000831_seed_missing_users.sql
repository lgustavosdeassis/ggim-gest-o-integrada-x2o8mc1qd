DO $$
DECLARE
  user_id uuid;
BEGIN
  -- User 1: admin@ggim.foz.br (Proprietário)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@ggim.foz.br') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      role, aud, confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      user_id, '00000000-0000-0000-0000-000000000000', 'admin@ggim.foz.br',
      crypt('admin', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Gestor GGIM"}',
      'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role, job_title)
    VALUES (user_id, 'admin@ggim.foz.br', 'Gestor GGIM', 'owner', 'Proprietário')
    ON CONFLICT (id) DO UPDATE SET role = 'owner';
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('admin', gen_salt('bf')) WHERE email = 'admin@ggim.foz.br';
    UPDATE public.profiles SET role = 'owner' WHERE email = 'admin@ggim.foz.br';
  END IF;

  -- User 2: ggim.ctfoz@gmail.com (Editor)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ggim.ctfoz@gmail.com') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      role, aud, confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      user_id, '00000000-0000-0000-0000-000000000000', 'ggim.ctfoz@gmail.com',
      crypt('ggim.ctfoz', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "GGIM CT Foz"}',
      'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role, job_title)
    VALUES (user_id, 'ggim.ctfoz@gmail.com', 'GGIM CT Foz', 'editor', 'Editor')
    ON CONFLICT (id) DO UPDATE SET role = 'editor';
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('ggim.ctfoz', gen_salt('bf')) WHERE email = 'ggim.ctfoz@gmail.com';
    UPDATE public.profiles SET role = 'editor' WHERE email = 'ggim.ctfoz@gmail.com';
  END IF;

  -- User 3: estagiariosggimfoz@gmail.com (Visualizador)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'estagiariosggimfoz@gmail.com') THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      role, aud, confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      user_id, '00000000-0000-0000-0000-000000000000', 'estagiariosggimfoz@gmail.com',
      crypt('ggim.2026', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Estagiários GGIM"}',
      'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role, job_title)
    VALUES (user_id, 'estagiariosggimfoz@gmail.com', 'Estagiários GGIM', 'viewer', 'Visualizador')
    ON CONFLICT (id) DO UPDATE SET role = 'viewer';
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('ggim.2026', gen_salt('bf')) WHERE email = 'estagiariosggimfoz@gmail.com';
    UPDATE public.profiles SET role = 'viewer' WHERE email = 'estagiariosggimfoz@gmail.com';
  END IF;
END $$;
