import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";

/**
 * Garante que a ação está sendo executada por um gestor master autenticado.
 * Usado pelas ações exclusivas do gestor (integrantes, cargos, categorias).
 */
export async function requireAdmin() {
  const current = await getCurrentProfile();
  if (!current?.profile?.is_admin) {
    throw new Error("Acesso restrito a gestores.");
  }
  return current;
}

/**
 * Garante acesso ao painel: gestor master OU integrante aprovado.
 * Usado pelas ações de publicação (notícias).
 */
export async function requirePanelMember() {
  const current = await getCurrentProfile();
  const profile = current?.profile;
  if (!current || !profile) {
    throw new Error("Faça login para continuar.");
  }
  if (!profile.is_admin && profile.status !== "approved") {
    throw new Error("Acesso restrito a integrantes aprovados.");
  }
  return current;
}

/**
 * Versão para Server Components: exige gestor master e redireciona
 * integrantes comuns para a Visão geral do painel. Combina com os
 * layouts das áreas exclusivas do gestor.
 */
export async function requireAdminPage() {
  const current = await getCurrentProfile();
  if (!current?.profile?.is_admin) {
    redirect("/admin");
  }
  return current;
}
