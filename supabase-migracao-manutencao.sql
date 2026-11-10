-- ============================================================
-- Modo manutenção (executar NO SQL Editor do Supabase)
-- ============================================================

-- 1) Tabela de configuração do site.
CREATE TABLE IF NOT EXISTS public.site_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_config (key, value)
VALUES ('maintenance_mode', 'off')
ON CONFLICT (key) DO NOTHING;

-- 2) Sinaliza quem é gestor (leia is_admin sem depender de grant em profiles).
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.is_admin
  )
$$;

-- 3) Segurança da tabela.
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_config_leitura" ON public.site_config;
CREATE POLICY "site_config_leitura" ON public.site_config
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_config_gestor_atualiza" ON public.site_config;
CREATE POLICY "site_config_gestor_atualiza" ON public.site_config
  FOR UPDATE TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());
