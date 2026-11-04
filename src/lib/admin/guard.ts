import { isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * As páginas do painel só consultam o banco quando o Supabase está
 * configurado. Caso contrário, o layout de (painel) mostra o aviso de
 * configuração e as páginas não renderizam nada.
 */
export function adminConfigured(): boolean {
  return isSupabaseConfigured();
}
