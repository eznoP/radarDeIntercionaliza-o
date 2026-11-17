-- ============================================================
-- Migração: novas funções de integrante (orientadora, desenvolvedor)
-- Executar no Supabase SQL Editor (Dashboard > SQL Editor).
-- ============================================================

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_funcao_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_funcao_check CHECK (
    funcao IS NULL OR funcao IN (
      'bolsista',
      'bolsista_voluntario',
      'extensionista',
      'orientadora',
      'desenvolvedor'
    )
  );
