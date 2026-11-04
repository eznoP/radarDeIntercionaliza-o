import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { adminConfigured } from "@/lib/admin/guard";
import { IntegranteForm } from "../integrante-form";

export const metadata = { title: "Novo integrante" };

export default async function NovoIntegrantePage() {
  if (!adminConfigured()) return null;
  const supabase = await createClient();
  const { data: roles } = await supabase
    .from("roles")
    .select("id, name")
    .order("sort_order", { ascending: true });

  return (
    <>
      <AdminPageHeader
        title="Novo integrante"
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
        <IntegranteForm roles={roles ?? []} />
      </div>
    </>
  );
}
