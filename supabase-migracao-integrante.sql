-- ============================================================
-- Migração do integrante (executar NO SQL Editor do Supabase)
-- Rode DEPOIS de supabase-hardening.sql, se ainda não rodou.
-- ============================================================

-- 1) E-mail de contato público do integrante (substitui o link do portfólio).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_email text;

-- 2) Função do integrante: Bolsista, Bolsista Voluntário ou Extensionista.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS funcao text;
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_funcao_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_funcao_check CHECK (
    funcao IS NULL OR funcao IN ('bolsista', 'bolsista_voluntario', 'extensionista')
  );

-- 3) Permissões de leitura para anônimos (o site público usa a chave anônima).
--    portfolio_email e funcao ficam visíveis; email (login), access e user_id
--    continuam bloqueados.
REVOKE SELECT ON TABLE public.profiles FROM anon;
GRANT SELECT (
  id, slug, full_name, bio, avatar_url,
  linkedin_url, lattes_url, portfolio_email,
  role_id, funcao, is_admin, status, created_at
) ON TABLE public.profiles TO anon;
GRANT SELECT ON TABLE public.profiles TO authenticated;
