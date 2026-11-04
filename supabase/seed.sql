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
