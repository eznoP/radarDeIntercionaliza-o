type SiteConfig = {
  readonly name: string;
  readonly shortName: string;
  readonly tagline: string;
  /**
   * Newsletter mantida externamente pelo cliente.
   * Preencha com a URL real para reativar o link na navbar, no rodapé e o
   * bloco de assinatura na Home. Enquanto for `null`, esses elementos somem.
   */
  readonly newsletterUrl: string | null;
};

export const site: SiteConfig = {
  name: "Radar de Internacionalização",
  shortName: "Radar",
  tagline:
    "Notícias, tendências e casos de comércio exterior e internacionalização.",
  newsletterUrl: null,
};

/** Nome do ícone da marca associado a um link (ver brand-icons.tsx). */
export type BrandIconName = "globe" | "compass" | "chart" | "plane";

export type NavLinkItem = {
  label: string;
  href: string;
  icon?: BrandIconName;
};

/** Item de menu que abre um dropdown. */
export type NavMenu = {
  label: string;
  items: NavLinkItem[];
  align?: "left" | "right";
};

export type NavEntry = NavLinkItem | NavMenu;

/** Diferencia um link simples de um menu expansível. */
export function isMenu(entry: NavEntry): entry is NavMenu {
  return "items" in entry;
}

/** Páginas agrupadas sob "Sobre nós". */
export const aboutLinks: NavLinkItem[] = [
  { label: "Sobre o projeto", href: "/sobre-o-projeto" },
  { label: "Integrantes", href: "/integrantes" },
];

/** Itens do menu suspenso "Ferramentas". */
export const toolLinks: NavLinkItem[] = [
  {
    label: "Mapas interativos globais",
    href: "/mapas-interativos",
    icon: "globe",
  },
  {
    label: "Radar de tendências",
    href: "/radar-de-tendencias",
    icon: "compass",
  },
  {
    label: "Painel de indicadores",
    href: "/painel-de-indicadores",
    icon: "chart",
  },
  {
    label: "Casos de internacionalização",
    href: "/casos-de-internacionalizacao",
    icon: "plane",
  },
];

/**
 * Estrutura da barra de navegação, na ordem exibida.
 * "Sobre nós" e "Ferramentas" são menus expansíveis.
 * O item "Newsletter" só aparece quando há uma URL configurada.
 */
const newsletterNav: NavEntry[] = site.newsletterUrl
  ? [{ label: "Newsletter", href: "/#newsletter" }]
  : [];

export const navItems: NavEntry[] = [
  { label: "Sobre nós", items: aboutLinks, align: "left" },
  ...newsletterNav,
  { label: "Podcast", href: "/podcast" },
  { label: "Ferramentas", items: toolLinks, align: "right" },
];
