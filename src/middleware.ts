import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Só roda no painel — mantém o site público rápido e estático.
  matcher: ["/admin/:path*"],
};
