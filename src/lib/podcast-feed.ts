/**
 * Episódios do podcast.
 *
 * Fonte: feed RSS oficial do podcast (variável PODCAST_FEED_URL).
 * Todo podcast hospedado no Spotify (via Spotify for Creators/Megaphone)
 * tem um RSS público; novos episódios aparecem no site automaticamente
 * (atualização a cada 30 min).
 *
 * Sem o feed configurado (ou indisponível), a lista fica vazia e a página
 * mostra o estado "nada publicado ainda".
 */

export type Episodio = {
  titulo: string;
  descricao: string;
  /** Data de publicação, já formatada em pt-BR. */
  data: string;
  /** Duração legível (ex.: "42 min"). */
  duracao: string;
  /** URL do áudio (pode ser externa — o player passa pelo proxy interno). */
  audioUrl: string;
  /** Capa do episódio, se o feed informar. */
  capa?: string;
};

const FEED_URL = process.env.PODCAST_FEED_URL;

function stripHtml(texto: string): string {
  return texto
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function tag(item: string, nome: string): string | undefined {
  const m = item.match(
    new RegExp(`<${nome}[^>]*>([\\s\\S]*?)<\\/${nome}>`, "i"),
  );
  return m ? stripHtml(m[1]) : undefined;
}

/** Converte segundos (itunes:duration) ou "HH:MM:SS" para texto legível. */
function duracaoLegivel(bruta?: string): string {
  if (!bruta) return "";
  const partes = bruta
    .trim()
    .split(":")
    .map((p) => Number(p) || 0);
  let total = 0;
  if (partes.length === 1) total = partes[0];
  else if (partes.length === 2) total = partes[0] * 60 + partes[1];
  else total = partes[0] * 3600 + partes[1] * 60 + partes[2];
  if (!total) return "";
  const h = Math.floor(total / 3600);
  const m = Math.round((total % 3600) / 60);
  if (h > 0) return `${h} h ${m ? `${m} min` : ""}`.trim();
  return `${m || 1} min`;
}

function dataLegivel(bruta?: string): string {
  if (!bruta) return "";
  const d = new Date(bruta);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
}

function parseFeed(xml: string): Episodio[] {
  const capaCanal =
    tag(xml, "image")
      ?.match(/<url[^>]*>([\s\S]*?)<\/url>/i)?.[1]
      ?.trim() ?? undefined;

  const itens = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const episódios: Episodio[] = [];
  for (const item of itens) {
    const enclosure = item
      .match(/<enclosure[^>]*url="([^"]+)"/i)?.[1]
      ?.replace(/&amp;/g, "&");
    if (!enclosure) continue;
    episódios.push({
      titulo: tag(item, "title") ?? "Sem título",
      descricao:
        (tag(item, "itunes:summary") ?? tag(item, "description") ?? "").slice(
          0,
          320,
        ),
      data: dataLegivel(tag(item, "pubDate")),
      duracao:
        duracaoLegivel(tag(item, "itunes:duration")) ||
        duracaoLegivel(item.match(/<enclosure[^>]*length="(\d+)"/i)?.[1]),
      audioUrl: enclosure,
      capa:
        tag(item, "itunes:image")
          ?.match(/href="([^"]+)"/i)?.[1]
          ?.replace(/&amp;/g, "&") ?? capaCanal,
    });
  }
  return episódios;
}

export async function getEpisodios(): Promise<Episodio[]> {
  if (!FEED_URL) return [];

  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "RadarDeInternacionalizacao/1.0" },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.error("[podcast] feed respondeu", res.status);
      return [];
    }
    return parseFeed(await res.text());
  } catch (erro) {
    console.error("[podcast] falha ao ler o feed:", String(erro));
    return [];
  }
}
