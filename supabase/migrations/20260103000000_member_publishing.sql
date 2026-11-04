-- ============================================================================
-- Radar de Internacionalização — Integrantes aprovados publicam
-- Execute no SQL Editor do Supabase DEPOIS de 20260102000000_profiles_access_status.sql.
-- É idempotente: pode ser executado novamente sem quebrar.
--
-- O que muda:
--   1. Integrante aprovado (status='approved') cria/edita/exclui SOMENTE as
--      próprias publicações.
--   2. "Destaque na Home" continua sendo curadoria exclusiva do gestor master.
--   3. Integrante aprovado envia imagem/vídeo no bucket `media`.
--   4. Categorias, cargos e outros integrantes seguem exclusivos do gestor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helpers de identidade e permissão
-- ---------------------------------------------------------------------------
-- id do perfil do usuário logado (ou null)
create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id from public.profiles p where p.user_id = auth.uid() limit 1;
$$;

-- true se o usuário logado é um integrante aprovado (pode publicar)
create or replace function public.can_publish()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.status = 'approved'
  );
$$;

-- ---------------------------------------------------------------------------
-- posts: integrante aprovado gerencia apenas as próprias publicações
-- ---------------------------------------------------------------------------
drop policy if exists "posts_select_own" on public.posts;
create policy "posts_select_own" on public.posts for select to authenticated
  using (author_id = public.current_profile_id());

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts for insert to authenticated
  with check (author_id = public.current_profile_id() and public.can_publish());

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts for update to authenticated
  using (author_id = public.current_profile_id() and public.can_publish())
  with check (author_id = public.current_profile_id());

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts for delete to authenticated
  using (author_id = public.current_profile_id() and public.can_publish());

-- ---------------------------------------------------------------------------
-- Destaque na Home é curadoria do gestor: integrante não marca/desmarca.
-- ---------------------------------------------------------------------------
create or replace function public.guard_post_featured()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Sem sessão (service_role / SQL Editor) ou gestor: não interfere.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.is_featured := false;
  else
    new.is_featured := old.is_featured;
  end if;
  return new;
end $$;

drop trigger if exists trg_posts_guard_featured on public.posts;
create trigger trg_posts_guard_featured
  before insert or update on public.posts
  for each row execute function public.guard_post_featured();

-- ---------------------------------------------------------------------------
-- Storage: integrante aprovado envia mídia no bucket `media`
-- (o upload de avatar continua restrito a avatars/{auth.uid()}/)
-- ---------------------------------------------------------------------------
drop policy if exists "storage_media_member_insert" on storage.objects;
create policy "storage_media_member_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.can_publish());

drop policy if exists "storage_media_member_update" on storage.objects;
create policy "storage_media_member_update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.can_publish())
  with check (bucket_id = 'media' and public.can_publish());

drop policy if exists "storage_media_member_delete" on storage.objects;
create policy "storage_media_member_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.can_publish());
