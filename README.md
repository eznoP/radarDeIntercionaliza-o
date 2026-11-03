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
