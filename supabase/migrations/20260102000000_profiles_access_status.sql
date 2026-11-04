-- ============================================================================
-- Radar de Internacionalização — Acesso por "acesso + senha" e status do perfil
-- Execute este arquivo no SQL Editor do Supabase DEPOIS da migration inicial.
-- É idempotente: pode ser executado novamente sem quebrar.
--
-- O que muda:
--   1. profiles.access  -> identificador de login (ex.: "joao.silva")
--   2. profiles.status  -> pending | approved | inactive
--   3. RLS: o integrante lê/edita SOMENTE o próprio perfil (não se promove)
--   4. Storage: o integrante envia avatar SOMENTE para avatars/{auth.uid()}/
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tipo de status do perfil
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.profile_status as enum ('pending', 'approved', 'inactive');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Novas colunas em profiles
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists access text;

alter table public.profiles
  add column if not exists status public.profile_status not null default 'approved';

alter table public.profiles
  add column if not exists website_url text;

-- Acesso é único (ignorando maiúsculas/minúsculas) quando informado.
create unique index if not exists profiles_access_unique_idx
  on public.profiles (lower(access))
  where access is not null;

-- ---------------------------------------------------------------------------
-- Gestor: continua sendo quem tem is_admin = true e não está inativo
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.is_admin
      and p.status <> 'inactive'
  );
$$;

-- ---------------------------------------------------------------------------
-- Trigger: impede que um integrante comum se promova ou altere campos críticos
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Sem sessão de usuário (service_role, SQL Editor, bootstrap): não interfere.
  if auth.uid() is null then
    return new;
  end if;

  -- Gestores podem alterar qualquer perfil.
  if public.is_admin() then
    return new;
  end if;

  -- Integrante comum: preserva os campos de identidade e permissão.
  new.is_admin  := old.is_admin;
  new.user_id   := old.user_id;
  new.access    := old.access;
  new.email     := old.email;
  new.slug      := old.slug;
  new.status    := old.status;
  new.created_at := old.created_at;
  return new;
end $$;

drop trigger if exists trg_profiles_guard_update on public.profiles;
create trigger trg_profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- RLS de profiles
-- ---------------------------------------------------------------------------
-- Público: vê apenas perfis aprovados (e gestores veem tudo).
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles for select
  using (status = 'approved' or public.is_admin());

-- O próprio integrante lê o seu perfil (mesmo pendente/inativo).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated
  using (user_id = auth.uid());

-- O próprio integrante edita o seu perfil; o trigger impede escalada de privilégio.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and is_admin = false);

-- Gestores continuam com acesso total.
drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write" on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: integrante gerencia apenas a própria pasta em avatars/{uid}/
-- ---------------------------------------------------------------------------
drop policy if exists "storage_avatars_own_insert" on storage.objects;
create policy "storage_avatars_own_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_avatars_own_update" on storage.objects;
create policy "storage_avatars_own_update" on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_avatars_own_delete" on storage.objects;
create policy "storage_avatars_own_delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Marca os perfis já existentes como aprovados (o gestor master do bootstrap)
-- ---------------------------------------------------------------------------
update public.profiles set status = 'approved' where status is null;
