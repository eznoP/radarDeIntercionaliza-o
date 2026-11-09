import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { adminConfigured } from "@/lib/admin/guard";
import { IntegranteForm } from "../integrante-form";

export const metadata = { title: "Editar integrante" };

export default async function EditarIntegrantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!adminConfigured()) return null;
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: integrante }, { data: roles }, current] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("roles")
      .select("id, name")
      .order("sort_order", { ascending: true }),
    getCurrentProfile(),
  ]);

  if (!integrante) notFound();

  return (
    <>
      <AdminPageHeader
        title="Editar integrante"
        action={
          <Link
            href="/admin/integrantes"
            className="inline-flex items-center gap-2 font-display text-sm font-medium text-glaucous transition hover:text-dark-green"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />
      <div className="max-w-3xl rounded-card border border-dark-green/10 bg-white p-6 shadow-sm">
        <IntegranteForm
          integrante={integrante}
          roles={roles ?? []}
          isSelf={integrante.id === current?.profile?.id}
        />
      </div>
    </>
  );
}
