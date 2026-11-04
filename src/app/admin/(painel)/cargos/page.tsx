import Link from "next/link";
import { Pencil } from "lucide-react";
import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { createClient } from "@/lib/supabase/server";
import { adminConfigured } from "@/lib/admin/guard";
import { RoleForm } from "./role-form";
import { deleteRole } from "./actions";

export const metadata = { title: "Cargos" };

export default async function CargosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  if (!adminConfigured()) return null;
  const { ok, erro } = await searchParams;
  const supabase = await createClient();
  const { data: roles } = await supabase
    .from("roles")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const list = roles ?? [];

  return (
    <>
      <AdminPageHeader
        title="Cargos"
        description="Área exclusiva para os cargos dos integrantes."
      />
      <AdminAlert ok={ok} erro={erro} />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="h-fit rounded-card border border-dark-green/10 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold text-dark-green">
            Novo cargo
          </h2>
          <RoleForm />
        </section>

        <section className="rounded-card border border-dark-green/10 bg-white shadow-sm">
          <div className="border-b border-dark-green/10 px-5 py-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink/60">
              {list.length} {list.length === 1 ? "cargo" : "cargos"}
            </h2>
          </div>

          {list.length === 0 ? (
            <p className="px-5 py-10 text-center font-body text-sm text-ink/50">
              Nenhum cargo cadastrado ainda. Crie o primeiro ao lado.
            </p>
          ) : (
            <ul className="divide-y divide-dark-green/10">
              {list.map((role) => (
                <li
                  key={role.id}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-dark-green">
                      {role.name}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-ink/45">
                      /{role.slug}
                    </p>
                    {role.description && (
                      <p className="mt-1 font-body text-xs text-ink/60">
                        {role.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/cargos/${role.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-display text-xs font-semibold text-glaucous transition hover:bg-glaucous/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                    <DeleteButton
                      action={deleteRole.bind(null, role.id)}
                      confirmText={`Excluir o cargo "${role.name}"?`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
