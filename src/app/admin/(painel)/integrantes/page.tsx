import Link from "next/link";
import { Pencil, Plus, ShieldCheck } from "lucide-react";
import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { createClient } from "@/lib/supabase/server";
import { adminConfigured } from "@/lib/admin/guard";
import { deleteIntegrante } from "./actions";

export const metadata = { title: "Integrantes" };

export default async function IntegrantesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  if (!adminConfigured()) return null;
  const { ok, erro } = await searchParams;
  const supabase = await createClient();

  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name", { ascending: true }),
    supabase.from("roles").select("id, name"),
  ]);

  const list = profiles ?? [];
  const roleName = new Map((roles ?? []).map((r) => [r.id, r.name]));

  return (
    <>
      <AdminPageHeader
        title="Integrantes"
        description="Pessoas do projeto. Área separada de Cargos e Categorias."
        action={
          <Link
            href="/admin/integrantes/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-dark-green px-4 py-2.5 font-display text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-moss hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Novo integrante
          </Link>
        }
      />
      <AdminAlert ok={ok} erro={erro} />

      {list.length === 0 ? (
        <div className="rounded-card border border-dark-green/10 bg-white px-5 py-12 text-center shadow-sm">
          <p className="font-body text-sm text-ink/60">
            Nenhum integrante cadastrado ainda.
          </p>
          <Link
            href="/admin/integrantes/novo"
            className="mt-4 inline-flex items-center gap-2 font-display text-sm font-semibold text-glaucous hover:text-dark-green"
          >
            <Plus className="h-4 w-4" />
            Cadastrar o primeiro
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-dark-green/10 bg-white shadow-sm">
          <ul className="divide-y divide-dark-green/10">
            {list.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 px-4 py-3.5 sm:px-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-sand text-sm font-semibold text-dark-green">
                  {p.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    p.full_name.slice(0, 1).toUpperCase()
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-semibold text-dark-green">
                      {p.full_name}
                    </p>
                    {p.is_admin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-moss/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dark-green">
                        <ShieldCheck className="h-3 w-3" />
                        Gestor
                      </span>
                    )}
                    {!p.is_active && (
                      <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="truncate font-body text-xs text-ink/55">
                    {p.email ?? "sem e-mail"}
                    {p.role_id && roleName.has(p.role_id)
                      ? ` · ${roleName.get(p.role_id)}`
                      : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/integrantes/${p.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-display text-xs font-semibold text-glaucous transition hover:bg-glaucous/10"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Link>
                  <DeleteButton
                    action={deleteIntegrante.bind(null, p.id)}
                    confirmText={`Excluir o integrante "${p.full_name}"?`}
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
