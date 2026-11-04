/**
 * Tipos e utilitários de apresentação das publicações.
 * Este arquivo é "puro" (sem imports de servidor) para poder ser usado
 * tanto em Server Components quanto em Client Components.
 */

/** Dados de uma publicação já formatados para os cards do site. */
export type PostCardData = {
  id: string;
  title: string;
  category: string;
  image: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
};

/** "há X" a partir de uma data ISO. */
export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMin = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} ${days === 1 ? "dia" : "dias"}`;
}
