import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Cliente Supabase anônimo, SEM cookies — só para leituras do site público
 * (home, notícias, integrantes). Como não usa `cookies()`, as páginas que
 * o chamam podem ser renderizadas estaticamente e revalidadas por ISR.
 * A RLS do banco continua valendo: enxerga o mesmo que um visitante anônimo.
 */
export function createAnonClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}
