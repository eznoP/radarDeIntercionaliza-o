import { redirect } from "next/navigation";
import { getCurrentProfile, isSupabaseConfigured } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminNotice } from "@/components/admin/admin-notice";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <AdminNotice
        title="Supabase não configurado"
        description="Preencha o arquivo .env.local com a URL e as chaves do projeto Supabase e reinicie o servidor para acessar o painel."
      />
    );
  }

  const current = await getCurrentProfile();
  if (!current) redirect("/admin/login");

  const profile = current.profile;
  if (!profile) redirect("/meu-perfil");

  // Gestor master e integrantes aprovados usam o painel.
  // Pendentes/inativos continuam apenas na área do próprio perfil.
  const isAdmin = profile.is_admin;
  if (!isAdmin && profile.status !== "approved") {
    redirect("/meu-perfil");
  }

  return (
    <AdminShell
      isAdmin={isAdmin}
      profile={{
        name: profile.full_name,
        email: profile.email ?? (profile.access ? `acesso: ${profile.access}` : null),
      }}
    >
      {children}
    </AdminShell>
  );
}
