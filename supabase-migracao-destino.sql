-- ============================================================
-- Destino das publicações (executar NO SQL Editor do Supabase)
-- Cada publicação pode ser direcionada a uma das páginas que
-- recebem publicações. Coluna: posts.destino (slug da página).
-- ============================================================

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS destino text;

-- Valores válidos (deixa os antigos como estão, mas trava novos).
ALTER TABLE public.posts
  DROP CONSTRAINT IF EXISTS posts_destino_valido;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_destino_valido
  CHECK (
    destino IS NULL
    OR destino IN (
      'mapas-interativos',
      'radar-de-tendencias',
      'painel-de-indicadores',
      'casos-de-internacionalizacao'
    )
  );

-- Leitura pública precisa enxergar a coluna.
GRANT SELECT (destino) ON public.posts TO anon;
