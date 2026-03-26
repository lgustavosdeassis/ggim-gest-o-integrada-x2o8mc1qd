-- Adiciona colunas para gestão de permissões detalhadas na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_generate_reports BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allowed_tabs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Força a recarga do schema cache para evitar erros PGRST204
NOTIFY pgrst, reload_schema;
