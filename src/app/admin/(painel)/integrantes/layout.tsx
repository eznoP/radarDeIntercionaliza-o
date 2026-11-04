import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";

/**
 * Área exclusiva do gestor master. Integrantes aprovados são
 * redirecionados para a Visão geral do painel.
 */
export default async function GestorOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentProfile();
  if (!current?.profile?.is_admin) redirect("/admin");
  return <>{children}</>;
}
