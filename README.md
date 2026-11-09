# Radar de Internacionalização

Site do projeto **Radar de Internacionalização** — sala do curso de Relações
Internacionais. Divulga notícias, tendências, casos e indicadores de comércio
exterior e internacionalização, com um painel administrativo para a equipe.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** + componentes próprios
- **Vercel** (hospedagem) + **Supabase** (banco, autenticação e storage) — fases seguintes
- Conversão de mídia: imagens para `.webp` (sharp) e vídeos para `.webm` (ffmpeg.wasm no navegador)

## Identidade visual

Paleta (definida pelo cliente):

| Cor         | HEX       |
| ----------- | --------- |
| Dark Green  | `#243C2C` |
| Moss Green  | `#7A9445` |
| Vanilla     | `#ECE69D` |
| Powder Blue | `#A9B6C4` |
| Glaucous    | `#59789F` |

Fontes:
- **Google Sans** — botões, navbar e títulos/home
- **Xmind** — corpo do texto das notícias

Ambas são self-hospedadas em `src/fonts/` (subsetadas para latin/latin-ext, SIL OFL).

## Acesso de integrantes

O fluxo de acesso é: **cadastro próprio → aprovação do gestor → login**.

1. O integrante se cadastra sozinho em `/cadastro` (nome, acesso e senha),
   linkado também na tela "Entrar" do painel.
2. A conta nasce **pendente**: sem sessão, sem aparecer no site e sem
   acesso a nada.
3. O gestor revisa e aprova em `/admin/integrantes` (botão "Aprovar" — que
   também libera o login no Supabase Auth).
4. Aprovado, o integrante entra em `/admin/login` e publica com escopo
   restrito; pendentes têm apenas a área `/meu-perfil`.

Aprovar também confirma o e-mail interno da conta (a chave
`SUPABASE_SERVICE_ROLE_KEY` precisa estar configurada), caso contrário o
Supabase Auth recusa a autenticação mesmo com o perfil aprovado.

## Estrutura

```
src/
  app/            rotas (App Router)
  components/     header, footer, cards, carrossel
  fonts/          Google Sans e Xmind (woff2, subsetadas)
  lib/            utilitários e dados
public/
  brand/          logotipo e imagens da identidade visual
```

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
```

## Roadmap

- [x] **Fase 1** — Setup + tela inicial (Home) responsiva
- [ ] **Fase 2** — Supabase (schema + RLS + autenticação)
- [ ] **Fase 3** — Painel administrativo (CRUD + categorias/roles separados)
- [ ] **Fase 4** — Demais páginas: Podcast, Radar de tendências, Casos,
      Mapas interativos, Painel de indicadores
