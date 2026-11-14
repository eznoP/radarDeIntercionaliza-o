/**
 * Páginas que recebem publicações do painel.
 * As demais (Home, Sobre nós, Integrantes, Newsletter e Podcast) não
 * recebem publicações — Home e Podcast são automáticas.
 */

export const DESTINOS = [
  {
    slug: "mapas-interativos",
    label: "Mapas interativos globais",
    href: "/mapas-interativos",
  },
  {
    slug: "radar-de-tendencias",
    label: "Radar de tendências",
    href: "/radar-de-tendencias",
  },
  {
    slug: "painel-de-indicadores",
    label: "Painel de indicadores",
    href: "/painel-de-indicadores",
  },
  {
    slug: "casos-de-internacionalizacao",
    label: "Casos de internacionalização",
    href: "/casos-de-internacionalizacao",
  },
] as const;

export type DestinoSlug = (typeof DESTINOS)[number]["slug"];

/** Rótulo de um destino válido; null caso contrário. */
export function labelOfDestino(destino: string | null | undefined): string | null {
  return DESTINOS.find((d) => d.slug === destino)?.label ?? null;
}

/** Devolve o slug se for um destino válido, senão null. */
export function normalizeDestino(valor: FormDataEntryValue | null): string | null {
  const s = typeof valor === "string" ? valor.trim() : "";
  return DESTINOS.some((d) => d.slug === s) ? s : null;
}
