import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { adminConfigured } from "@/lib/admin/guard";
import { PostForm } from "../../post-form";

export const metadata = { title: "Editar publicação" };

export default async function EditarPublicacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!adminConfigured()) return null;
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: post }, { data: categories }, { data: authors }] =
    await Promise.all([
      supabase.from("posts").select("*").eq("id", id).maybeSingle(),
      supabase.from("categories").select("id, name").order("sort_order"),
      supabase
        .from("profiles")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name"),
    ]);

  if (!post) notFound();

  return (
    <>
      <AdminPageHeader
        title="Editar publicação"
        description={`Atualize “${post.title}”.`}
        action={
          <Link
            href="/admin/publicacoes"
            className="inline-flex items-center gap-2 font-display text-sm font-medium text-glaucous transition hover:text-dark-green"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />
      <div className="max-w-4xl">
        <PostForm
          post={post}
          categories={categories ?? []}
          authors={authors ?? []}
        />
      </div>
    </>
  );
}
