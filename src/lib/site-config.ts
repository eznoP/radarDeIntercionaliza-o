export const site = {
  name: "Radar de Internacionalização",
  shortName: "Radar",
  tagline:
    "Notícias, tendências e casos de comércio exterior e internacionalização.",
  // Newsletter é mantida externamente pelo cliente (por e-mail).
  newsletterUrl: "mailto:newsletter@radar.example",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

/** Links principais da barra de navegação. */
export const navLinks: NavItem[] = [
  { label: "Sobre nós", href: "/sobre-nos" },
  { label: "Newsletter", href: "/#newsletter" },
  { label: "Podcast", href: "/podcast" },
];

/** Itens do menu suspenso "Ferramentas". */
export const toolLinks: NavItem[] = [
  { label: "Mapas interativos globais", href: "/mapas-interativos" },
  { label: "Radar de tendências", href: "/radar-de-tendencias" },
  { label: "Painel de indicadores", href: "/painel-de-indicadores" },
  { label: "Casos de internacionalização", href: "/casos-de-internacionalizacao" },
];
