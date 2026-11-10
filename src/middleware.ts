import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Interruptor de manutenção, lido da tabela site_config no Supabase.
 * Em memória por 30 s (por instância) — ativação/desativação leva até 30 s.
 * Se o Supabase não responder, o site fica "não ativo" (falha aberta).
 */
const MAINTENANCE_TTL_MS = 30_000;
let maintenance: { on: boolean; checkedAt: number } | null = null;

async function maintenanceOn(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  if (maintenance && Date.now() - maintenance.checkedAt < MAINTENANCE_TTL_MS) {
    return maintenance.on;
  }

  let on = false;
  try {
    const res = await fetch(
      `${url}/rest/v1/site_config?select=value&key=eq.maintenance_mode&limit=1`,
      {
        headers: { apikey: anon, Authorization: `Bearer ${anon}` },
        cache: "no-store",
        signal: AbortSignal.timeout(2000),
      },
    );
    if (res.ok) {
      const rows = (await res.json()) as { value?: string }[];
      on = rows[0]?.value === "on";
    }
  } catch {
    // Falha aberta: mantém o site no ar.
  }
  maintenance = { on, checkedAt: Date.now() };
  return on;
}

/**
 * 1. Rotas públicas: redireciona para /manutencao quando o modo está ativo.
 * 2. Rotas com sessão (/admin e /meu-perfil): renova a sessão do Supabase e
 *    protegem o painel — ficam acessíveis durante uma manutenção.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const comSessao =
    pathname.startsWith("/admin") || pathname.startsWith("/meu-perfil");

  if (!comSessao) {
    if (!pathname.startsWith("/manutencao") && (await maintenanceOn())) {
      return NextResponse.redirect(
        new URL("/manutencao", request.nextUrl.origin),
      );
    }
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  // Tudo exceto arquivos estáticos (_next, imagens, fontes, ícones, robôs).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.png|opengraph-image.png|twitter-image.png|robots.txt|.*\\.\\w+$).*)",
  ],
};
