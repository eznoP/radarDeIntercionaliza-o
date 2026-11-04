import { getCurrentProfile } from "@/lib/supabase/server";

/**
 * Garante que a ação está sendo executada por um gestor autenticado.
 * Lança erro (500) caso contrário — as Server Actions só são expostas
 * no painel protegido, mas validamos mesmo assim.
 */
export async function requireAdmin() {
  const current = await getCurrentProfile();
  if (!current?.profile?.is_admin) {
    throw new Error("Acesso restrito a gestores.");
  }
  return current;
}
