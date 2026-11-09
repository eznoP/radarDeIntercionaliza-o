import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { adminConfigured } from "@/lib/admin/guard";
import { RoleForm } from "../role-form";

export const metadata = { title: "Editar cargo" };

export default async function EditarCargoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!adminConfigured()) return null;
  const { id } = await params;
  const supabase = await createClient();
  const { data: role } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!role) notFound();

  return (
    <>
      <AdminPageHeader
        title="Editar cargo"
        action={
          <Link
            href="/admin/cargos"
            className="inline-flex items-center gap-2 font-display text-sm font-medium text-glaucous transition hover:text-dark-green"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />
      <div className="max-w-xl rounded-card border border-dark-green/10 bg-white p-6 shadow-sm">
        <RoleForm role={role} />
      </div>
    </>
  );
}
