import Link from "next/link";
import { Pencil, Plus, Star } from "lucide-react";
import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { adminConfigured } from "@/lib/admin/guard";
import type { PostStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { deletePost } from "./actions";

export const metadata = { title: "Publicações" };

const STATUS_LABEL: Record<string, string> = {
  published: "Publicado",
  draft: "Rascunho",
  archived: "Arquivado",
};

const STATUS_CLASS: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  draft: "bg-amber-50 text-amber-800 ring-amber-200",
  archived: "bg-sand text-ink/60 ring-dark-green/10",
};

const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "published", label: "Publicadas" },
  { value: "draft", label: "Rascunhos" },
  { value: "archived", label: "Arquivadas" },
];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function PublicacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; status?: string }>;
}) {
  if (!adminConfigured()) return null;
  const { ok, erro, status } = await searchParams;
  const filter: PostStatus | "all" =
    status === "published" || status === "draft" || status === "archived"
      ? status
      : "all";

  const supabase = await createClient();
  const current = await getCurrentProfile();
  const isAdmin = Boolean(current?.profile?.is_admin);

  let query = supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  // Integrante aprovado vê e gerencia apenas as próprias publicações.
  if (!isAdmin && current?.profile) {
    query = query.eq("author_id", current.profile.id);
  }

  if (filter !== "all") query = query.eq("status", filter);

  const [{ data: posts }, { data: categories }, { data: authors }] =
    await Promise.all([
      query,
      supabase.from("categories").select("id, name"),
      supabase.from("profiles").select("id, full_name"),
    ]);

  const list = posts ?? [];
  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const authorName = new Map((authors ?? []).map((a) => [a.id, a.full_name]));

  return (
    <>
      <AdminPageHeader
        title="Publicações"
        description={
          isAdmin
            ? "Notícias e conteúdos do site. Destaques aparecem na Home."
            : "As suas publicações. Você pode criar, editar e excluir apenas os seus conteúdos."
        }
        action={
          <Link
            href="/admin/publicacoes/nova"
            className="inline-flex items-center gap-2 rounded-xl bg-dark-green px-4 py-2.5 font-display text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-moss hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nova publicação
          </Link>
        }
      />
      <AdminAlert ok={ok} erro={erro} />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === "all"
                ? "/admin/publicacoes"
                : `/admin/publicacoes?status=${f.value}`
            }
            className={cn(
              "rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition",
              filter === f.value
                ? "bg-dark-green text-white"
                : "bg-white text-ink/60 ring-1 ring-dark-green/15 hover:text-dark-green",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-card border border-dark-green/10 bg-white px-5 py-12 text-center shadow-sm">
          <p className="font-body text-sm text-ink/60">
            {isAdmin
              ? "Nenhuma publicação por aqui ainda."
              : "Você ainda não publicou nada."}
          </p>
          <Link
            href="/admin/publicacoes/nova"
            className="mt-4 inline-flex items-center gap-2 font-display text-sm font-semibold text-glaucous hover:text-dark-green"
          >
            <Plus className="h-4 w-4" />
            Criar a primeira publicação
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-dark-green/10 bg-white shadow-sm">
          <ul className="divide-y divide-dark-green/10">
            {list.map((post) => (
              <li
                key={post.id}
                className="flex items-start gap-4 px-4 py-4 sm:px-5"
              >
                <span className="hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-sand sm:block">
                  {post.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                        STATUS_CLASS[post.status],
                      )}
                    >
                      {STATUS_LABEL[post.status]}
                    </span>
                    {post.is_featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-vanilla px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dark-green">
                        <Star className="h-3 w-3" />
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-display text-sm font-semibold text-dark-green">
                    {post.title}
                  </p>
                  <p className="mt-0.5 truncate font-body text-xs text-ink/55">
                    {categoryName.get(post.category_id) ?? "Sem categoria"} ·{" "}
                    {authorName.get(post.author_id) ?? "Sem autor"} ·{" "}
                    {formatDate(post.published_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/publicacoes/${post.id}/editar`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-display text-xs font-semibold text-glaucous transition hover:bg-glaucous/10"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Link>
                  <DeleteButton
                    action={deletePost.bind(null, post.id)}
                    confirmText={`Excluir a publicação "${post.title}"?`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
