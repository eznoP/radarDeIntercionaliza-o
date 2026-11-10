import Link from "next/link";
import { CheckCircle2, Pencil, Plus, ShieldCheck } from "lucide-react";
import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { FormActionButton } from "@/components/admin/form-action-button";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { adminConfigured } from "@/lib/admin/guard";
import type { ProfileStatus } from "@/lib/database.types";
import { approveIntegrante, deleteIntegrante } from "./actions";
import { funcaoLabel } from "@/lib/member-funcao";
import { cn } from "@/lib/utils";

export const metadata = { title: "Integrantes" };

type Filtro = "todos" | ProfileStatus;

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "inactive", label: "Inativos" },
];

const STATUS_STYLE: Record<ProfileStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  inactive: "bg-sand text-ink/50",
};

const STATUS_LABEL: Record<ProfileStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  inactive: "Inativo",
};

const ORDER: Record<ProfileStatus, number> = {
  pending: 0,
  approved: 1,
  inactive: 2,
};

export default async function IntegrantesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; filtro?: string }>;
}) {
  if (!adminConfigured()) return null;
  const { ok, erro, filtro } = await searchParams;
  const activeFilter: Filtro = (["pending", "approved", "inactive"] as Filtro[]).includes(
    filtro as Filtro,
  )
    ? (filtro as Filtro)
    : "todos";

  const supabase = await createClient();

  const [profileData, { data: profiles }, { data: roles }] = await Promise.all([
    getCurrentProfile(),
    supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true }),
    supabase.from("roles").select("id, name"),
  ]);

  const myId = profileData?.profile?.id;

  const all = profiles ?? [];
  const roleName = new Map((roles ?? []).map((r) => [r.id, r.name]));
  const pendingCount = all.filter((p) => p.status === "pending").length;

  const list = all
    .filter((p) => activeFilter === "todos" || p.status === activeFilter)
    .sort((a, b) => {
      const byStatus = ORDER[a.status] - ORDER[b.status];
      return byStatus !== 0
        ? byStatus
        : a.full_name.localeCompare(b.full_name, "pt-BR");
    });

  return (
    <>
      <AdminPageHeader
        title="Integrantes"
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

      {pendingCount > 0 && activeFilter !== "pending" && (
        <Link
          href="/admin/integrantes?filtro=pending"
          className="mb-5 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100"
        >
          <CheckCircle2 className="h-4 w-4" />
          {pendingCount === 1
            ? "1 perfil aguardando aprovação."
            : `${pendingCount} perfis aguardando aprovação.`}
          <span className="underline">Revisar agora</span>
        </Link>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === "todos"
                ? "/admin/integrantes"
                : `/admin/integrantes?filtro=${f.value}`
            }
            className={cn(
              "rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition",
              activeFilter === f.value
                ? "bg-dark-green text-white"
                : "bg-white text-ink/60 ring-1 ring-dark-green/10 hover:bg-cream",
            )}
          >
            {f.label}
            {f.value === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-card border border-dark-green/10 bg-white px-5 py-12 text-center shadow-sm">
          <p className="font-body text-sm text-ink/60">
            {activeFilter === "todos"
              ? "Nenhum integrante cadastrado ainda."
              : "Nenhum integrante nesta situação."}
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
                className="flex flex-wrap items-center gap-4 px-4 py-3.5 sm:flex-nowrap sm:px-5"
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
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        STATUS_STYLE[p.status],
                      )}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                  <p className="truncate font-body text-xs text-ink/55">
                    {p.access ? `acesso: ${p.access}` : "sem acesso"}
                    {p.role_id && roleName.has(p.role_id)
                      ? ` · ${roleName.get(p.role_id)}`
                      : ""}
                    {funcaoLabel(p.funcao) ? ` · ${funcaoLabel(p.funcao)}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {p.id === myId ? (
                    <span className="px-2.5 py-1.5 font-display text-xs font-medium text-ink/40">
                      Você
                    </span>
                  ) : (
                    <>
                      {p.status === "pending" && (
                        <FormActionButton
                          action={approveIntegrante.bind(null, p.id)}
                          pendingLabel="Aprovando…"
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Aprovar
                        </FormActionButton>
                      )}
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
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
