import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminNotice } from "@/components/admin/admin-notice";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/actions";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = {
  title: "Meu perfil",
  robots: { index: false, follow: false },
};

export default async function MeuPerfilPage() {
  const current = await getCurrentProfile();
  if (!current) redirect("/admin/login");

  // O gestor master usa o painel; só integrantes comuns caem aqui.
  if (current.profile?.is_admin) redirect("/admin");

  const profile = current.profile;
  const supabase = await createClient();
  const { data: roles } = await supabase
    .from("roles")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const isPending = profile?.status === "pending";

  return (
    <>
      <SiteHeader />

      <main className="bg-cream">
        <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-dark-green/15 pb-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-dark-green sm:text-3xl">
                Meu perfil
              </h1>
              <p className="mt-1 font-body text-sm text-ink/60">
                Personalize como você aparece na página de Integrantes.
              </p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-xl px-3 py-2 font-display text-sm font-medium text-ink/60 transition hover:bg-dark-green/5 hover:text-dark-green"
              >
                Sair
              </button>
            </form>
          </div>

          {!profile ? (
            <div className="mt-6">
              <AdminNotice
                title="Perfil não encontrado"
                description="A sua conta existe, mas ainda não está vinculada a um perfil. Peça ao gestor para concluir o seu cadastro."
              />
            </div>
          ) : (
            <>
              {isPending && (
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    O seu perfil está <strong>aguardando aprovação</strong> do
                    gestor. Assim que for aprovado, ele aparecerá no site.
                  </span>
                </div>
              )}

              <div className="mt-6 rounded-card border border-dark-green/10 bg-white p-6 shadow-sm">
                <ProfileForm
                  profile={profile}
                  roles={roles ?? []}
                  userId={current.user.id}
                />
              </div>

              <div className="mt-8 rounded-card border border-dark-green/10 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-dark-green">
                  Segurança
                </h2>
                <p className="mb-4 mt-1 font-body text-sm text-ink/60">
                  Altere a senha do seu acesso.
                </p>
                <PasswordForm />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-sm text-ink/55">
                <Link
                  href="/integrantes"
                  className="inline-flex items-center gap-1.5 text-glaucous hover:text-dark-green"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver a página de Integrantes
                </Link>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-moss" />
                  O seu acesso não dá permissão de gestor.
                </span>
              </div>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
