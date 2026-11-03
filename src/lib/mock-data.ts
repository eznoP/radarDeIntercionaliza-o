export type Post = {
  id: string;
  title: string;
  category: string;
  /** Minutos desde a publicação (placeholder até integrar com o Supabase). */
  minutesAgo: number;
  image: string;
  isFeatured?: boolean;
};

/**
 * Dados de exemplo usados para validar a tela inicial antes da integração
 * com o Supabase. As imagens são da identidade visual do cliente.
 */
export const mockPosts: Post[] = [
  {
    id: "1",
    title: "Brasil amplia exportações para a Ásia no primeiro trimestre",
    category: "Comércio exterior",
    minutesAgo: 12,
    image: "/brand/containers.webp",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Novas rotas marítimas prometem reduzir custos logísticos",
    category: "Logística",
    minutesAgo: 48,
    image: "/brand/containers2.webp",
  },
  {
    id: "3",
    title: "Acordos comerciais: o que muda para pequenas empresas",
    category: "Internacionalização",
    minutesAgo: 180,
    image: "/brand/globo-vintage-aviao.webp",
  },
  {
    id: "4",
    title: "Câmbio e competitividade: como se preparar para 2027",
    category: "Economia",
    minutesAgo: 1440,
    image: "/brand/globo-vermelho.webp",
  },
  {
    id: "5",
    title: "Empresas brasileiras ganham espaço em feiras internacionais",
    category: "Negócios",
    minutesAgo: 2880,
    image: "/brand/globos-fala.webp",
  },
];

/** Formata "há X" a partir de minutos. */
export function formatTimeAgo(minutes: number): string {
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} ${days === 1 ? "dia" : "dias"}`;
}
