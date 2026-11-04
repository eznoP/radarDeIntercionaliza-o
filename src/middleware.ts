import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Só roda nas áreas que exigem login — mantém o site público rápido e estático.
  matcher: ["/admin/:path*", "/meu-perfil/:path*"],
};
