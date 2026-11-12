/**
 * Proxy de áudio do podcast: repassa o arquivo do feed externo para o
 * player do site sem abrir media-src da CSP para domínios de terceiro.
 * Suporta Range (permite pular trechos no player).
 */

const LIMITE_TAMANHO = 200 * 1024 * 1024; // 200 MB

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !/^https?:\/\//.test(url)) {
    return new Response("url inválida", { status: 400 });
  }

  const range = request.headers.get("range");

  const upstream = await fetch(url, {
    headers: {
      ...(range ? { Range: range } : {}),
      "User-Agent": "RadarDeInternacionalizacao/1.0",
    },
    // Sem cache do Next: o player controla os re-fetches por Range.
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);

  if (!upstream || !upstream.ok || !upstream.body) {
    return new Response("áudio indisponível", { status: 502 });
  }

  const contentLength = Number(upstream.headers.get("content-length") ?? 0);
  if (contentLength > LIMITE_TAMANHO) {
    return new Response("áudio muito grande", { status: 413 });
  }

  const cabeceros: Record<string, string> = {
    "Content-Type":
      upstream.headers.get("content-type") ?? "audio/mpeg",
    "Cache-Control": "public, max-age=3600",
  };
  const contentRange = upstream.headers.get("content-range");
  if (contentRange) {
    cabeceros["Content-Range"] = contentRange;
    cabeceros["Accept-Ranges"] = "bytes";
  } else {
    cabeceros["Accept-Ranges"] = "bytes";
  }
  if (contentLength) cabeceros["Content-Length"] = String(contentLength);

  return new Response(upstream.body, {
    status: upstream.status === 206 ? 206 : 200,
    headers: cabeceros,
  });
}
