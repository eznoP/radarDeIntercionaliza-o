import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { adminConfigured } from "@/lib/admin/guard";
import { CategoryForm } from "../category-form";

export const metadata = { title: "Editar categoria" };

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!adminConfigured()) return null;
  const { id } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!category) notFound();

  return (
    <>
      <AdminPageHeader
        title="Editar categoria"
        description={`Atualize os dados de "${category.name}".`}
        action={
          <Link
            href="/admin/categorias"
            className="inline-flex items-center gap-2 font-display text-sm font-medium text-glaucous transition hover:text-dark-green"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />
      <div className="max-w-xl rounded-card border border-dark-green/10 bg-white p-6 shadow-sm">
        <CategoryForm category={category} />
      </div>
    </>
  );
}
