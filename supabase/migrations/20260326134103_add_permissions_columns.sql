-- Adiciona as colunas can_generate_reports e allowed_tabs na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS can_generate_reports BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allowed_tabs JSONB DEFAULT '[]'::jsonb;

-- Força a atualização do cache do schema para o PostgREST (resolve o erro PGRST204)
NOTIFY pgrst, 'reload schema';
