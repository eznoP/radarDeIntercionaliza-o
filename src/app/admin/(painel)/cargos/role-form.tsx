"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createRole, updateRole } from "./actions";
import { Field, fieldInputClass } from "@/components/admin/fields";
import { FormMessage } from "@/components/admin/form-message";
import { initialFormState } from "@/lib/admin/types";
import type { Tables } from "@/lib/database.types";

type Role = Tables<"roles">;

export function RoleForm({
  role,
  onDone,
}: {
  role?: Role;
  onDone?: () => void;
}) {
  const action = role ? updateRole.bind(null, role.id) : createRole;
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />

      <Field label="Nome" htmlFor="name" required error={state.fieldErrors?.name}>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={role?.name ?? ""}
          placeholder="Ex.: Coordenação"
          className={fieldInputClass(Boolean(state.fieldErrors?.name))}
        />
      </Field>

      <Field label="Descrição" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={role?.description ?? ""}
          placeholder="Responsabilidades do cargo"
          className={fieldInputClass(false)}
        />
      </Field>

      <Field label="Ordem" htmlFor="sort_order">
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={role?.sort_order ?? 0}
          className={fieldInputClass(false)}
        />
      </Field>

      <div className="flex items-center gap-3 pt-1">
        <SaveButton label={role ? "Salvar alterações" : "Criar cargo"} />
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="font-display text-sm font-medium text-ink/60 transition hover:text-dark-green"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-xl bg-dark-green px-5 py-2.5 font-display text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-moss hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Salvando…" : label}
    </button>
  );
}
