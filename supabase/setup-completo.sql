
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.post_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Gatilho genérico: mantém updated_at sempre atualizado
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- CARGOS (roles)
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_roles_updated on public.roles;
create trigger trg_roles_updated before update on public.roles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- CATEGORIAS (categories)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- INTEGRANTES (profiles)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid unique references auth.users(id) on delete set null,
  full_name    text not null,
  email        text unique,
  slug         text not null unique,
  role_id      uuid references public.roles(id) on delete set null,
  bio          text,
  avatar_url   text,
  linkedin_url text,
  lattes_url   text,
  is_active    boolean not null default true,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- PUBLICAÇÕES (posts)
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  excerpt         text not null,
  content         jsonb,
  cover_image_url text,
  video_url       text,
  category_id     uuid not null references public.categories(id) on delete restrict,
  author_id       uuid not null references public.profiles(id) on delete restrict,
  is_featured     boolean not null default false,
  status          public.post_status not null default 'draft',
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_posts_updated on public.posts;
create trigger trg_posts_updated before update on public.posts
  for each row execute function public.set_updated_at();

create index if not exists posts_status_published_idx
  on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category_id);
create index if not exists posts_author_idx  on public.posts (author_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
-- Retorna true se o usuário autenticado é um gestor ativo.
-- SECURITY DEFINER evita recursão nas políticas de RLS de profiles.
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
      and p.is_active
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.roles      enable row level security;
alter table public.categories enable row level security;
alter table public.profiles   enable row level security;
alter table public.posts      enable row level security;

-- Cargos: leitura pública, escrita para gestores
drop policy if exists "roles_select_public" on public.roles;
create policy "roles_select_public" on public.roles for select using (true);

drop policy if exists "roles_admin_write" on public.roles;
create policy "roles_admin_write" on public.roles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Categorias: leitura pública, escrita para gestores
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories for select using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Integrantes: público vê os ativos; gestores veem e editam tudo
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles for select
  using (is_active or public.is_admin());

drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write" on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Publicações: público vê publicadas; gestores veem e editam tudo
drop policy if exists "posts_select_published" on public.posts;
create policy "posts_select_published" on public.posts for select
  using (status = 'published' or public.is_admin());

drop policy if exists "posts_admin_write" on public.posts;
create policy "posts_admin_write" on public.posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: buckets públicos de mídia
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/webp','image/jpeg','image/png','image/gif','video/webm','video/mp4']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "storage_media_public_read" on storage.objects;
create policy "storage_media_public_read" on storage.objects for select
  using (bucket_id in ('media', 'avatars'));

drop policy if exists "storage_media_admin_insert" on storage.objects;
create policy "storage_media_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('media', 'avatars') and public.is_admin());

drop policy if exists "storage_media_admin_update" on storage.objects;
create policy "storage_media_admin_update" on storage.objects for update to authenticated
  using (bucket_id in ('media', 'avatars') and public.is_admin())
  with check (bucket_id in ('media', 'avatars') and public.is_admin());

drop policy if exists "storage_media_admin_delete" on storage.objects;
create policy "storage_media_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id in ('media', 'avatars') and public.is_admin());

-- ===== DADOS INICIAIS (seed) =====

-- ============================================================================
-- Radar de Internacionalização — dados iniciais
-- Execute no SQL Editor do Supabase DEPOIS da migration.
-- ----------------------------------------------------------------------------

-- Cargos de exemplo (edite/remova à vontade no painel)
insert into public.roles (name, slug, sort_order) values
  ('Coordenação', 'coordenacao', 1),
  ('Redação',     'redacao',     2),
  ('Pesquisa',    'pesquisa',    3),
  ('Design',      'design',      4)
on conflict (slug) do nothing;

-- Categorias de exemplo
insert into public.categories (name, slug, sort_order) values
  ('Comércio exterior',      'comercio-exterior',   1),
  ('Logística',              'logistica',           2),
  ('Internacionalização',    'internacionalizacao', 3),
  ('Economia',               'economia',            4),
  ('Negócios',               'negocios',            5)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Bootstrap do primeiro gestor
-- ----------------------------------------------------------------------------
-- 1) Crie sua conta em: Authentication > Users > Add user
--    (marque "Auto Confirm User" para já poder entrar).
-- 2) Troque 'SEU_EMAIL_AQUI' pelo e-mail da conta e execute o bloco abaixo.
-- ----------------------------------------------------------------------------

-- insert into public.profiles (user_id, full_name, email, slug, is_admin)
-- select id,
--        split_part(email, '@', 1),
--        email,
--        regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9]+', '-', 'g'),
--        true
-- from auth.users
-- where email = 'SEU_EMAIL_AQUI'
-- on conflict (email) do update
--   set is_admin = true, user_id = excluded.user_id;

-- ############################################################################
-- # PARTE 2 — Acesso por "acesso + senha" e status do perfil (20260102000000)
-- ############################################################################

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
