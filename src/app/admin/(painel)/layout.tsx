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

  if (!current.profile?.is_admin) {
    return (
      <AdminNotice
        title="Acesso restrito"
        description="A sua conta está autenticada, mas não tem permissão de gestor. Peça a um administrador para liberar o seu acesso."
      />
    );
  }

  return (
    <AdminShell
      profile={{
        name: current.profile.full_name,
        email: current.profile.email,
      }}
    >
      {children}
    </AdminShell>
  );
}
