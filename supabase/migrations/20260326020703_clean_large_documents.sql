DO $$ 
DECLARE
  r RECORD;
BEGIN
  -- Truncate documents payload that is larger than 1MB to prevent "Unterminated string in JSON" fetch errors
  FOR r IN SELECT id FROM public.activities WHERE length(documents::text) > 1000000 LOOP
    UPDATE public.activities SET documents = '[]'::jsonb WHERE id = r.id;
  END LOOP;

  -- Truncate actions payload that is larger than 1MB
  FOR r IN SELECT id FROM public.activities WHERE length(actions::text) > 1000000 LOOP
    UPDATE public.activities SET actions = '[]'::jsonb WHERE id = r.id;
  END LOOP;

  -- Truncate participants_pf that are too large
  FOR r IN SELECT id FROM public.activities WHERE length(COALESCE(participants_pf, '')) > 1000000 LOOP
    UPDATE public.activities SET participants_pf = '(Dados muito grandes truncados por segurança)' WHERE id = r.id;
  END LOOP;

  -- Truncate participants_pj that are too large
  FOR r IN SELECT id FROM public.activities WHERE length(COALESCE(participants_pj, '')) > 1000000 LOOP
    UPDATE public.activities SET participants_pj = '(Dados muito grandes truncados por segurança)' WHERE id = r.id;
  END LOOP;
END $$;
