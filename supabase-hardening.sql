-- ============================================================
-- Endurecimento do Supabase (executar no SQL Editor do projeto)
-- ============================================================

-- 1) O pentest confirmou que a chave anônima consegue ler email e user_id
--    na tabela profiles via API REST. Estes dados dão o login do gestor
--    de graça para ataques de credenciais. Restrição por coluna para o
--    papel `anon` (a RLS continua valendo e o painel não é afetado):
REVOKE SELECT ON TABLE public.profiles FROM anon;
GRANT SELECT (
  id, slug, full_name, bio, avatar_url,
  linkedin_url, lattes_url, website_url,
  role_id, is_admin, status, created_at
) ON TABLE public.profiles TO anon;

-- authenticated continua com acesso completo:
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- 2) Conferir que posts só é legível por anon quando status = 'published'.
--    Rode e confira que a política pública filtra o status. Se não filtrar,
--    substitua a política USING por:
--      USING (status = 'published')
--    (rascunhos devem ficar restritos ao autor/gestor pelo papel authenticated.)

-- 3) Storage (bicans 'media' e 'avatars'): política de gravação só para
--    usuários autenticados, em pasta própria:
--      CREATE POLICY "upload_restrito" ON storage.objects
--      FOR INSERT TO authenticated
--      WITH CHECK (
--        bucket_id IN ('media','avatars')
--        AND storage.foldername(name)[1] = auth.uid()::text
--      );
--    O pentest já confirmou que anon NÃO consegue gravar (403). Manter.

-- 4) Ataques de força-bruta no login: o Supabase aplica limite de tentativas
--    e janela de bloqueio no /auth nativo — nenhuma medida extra é necessária.
--    Não testado de forma ativa contra a produção por segurança.
