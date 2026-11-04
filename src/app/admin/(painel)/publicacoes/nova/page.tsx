import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { adminConfigured } from "@/lib/admin/guard";
import { PostForm } from "../post-form";

export const metadata = { title: "Nova publicação" };

export default async function NovaPublicacaoPage() {
  if (!adminConfigured()) return null;
  const supabase = await createClient();
  const current = await getCurrentProfile();
  const isAdmin = Boolean(current?.profile?.is_admin);

  const [{ data: categories }, { data: authors }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  // Integrante publica em nome próprio: lista só com o seu próprio nome.
  const authorOptions = isAdmin
    ? (authors ?? [])
    : current?.profile
      ? [{ id: current.profile.id, full_name: current.profile.full_name }]
      : [];

  return (
    <>
      <AdminPageHeader
        title="Nova publicação"
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
          categories={categories ?? []}
          authors={authorOptions}
          isAdmin={isAdmin}
        />
      </div>
    </>
  );
}
