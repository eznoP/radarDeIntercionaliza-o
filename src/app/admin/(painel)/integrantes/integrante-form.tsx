"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Field, fieldInputClass } from "@/components/admin/fields";
import { FormMessage } from "@/components/admin/form-message";
import { initialFormState } from "@/lib/admin/types";
import type { Tables } from "@/lib/database.types";
import { checkIntegranteEmail, createIntegrante, updateIntegrante } from "./actions";

type Integrante = Tables<"profiles">;

export function IntegranteForm({
  integrante,
  roles,
}: {
  integrante?: Integrante;
  roles: Pick<Tables<"roles">, "id" | "name">[];
}) {
  const action = integrante
    ? updateIntegrante.bind(null, integrante.id)
    : createIntegrante;
  const [state, formAction] = useActionState(action, initialFormState);

  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [checking, startCheck] = useTransition();
  const [grantAccess, setGrantAccess] = useState(
    Boolean(integrante?.is_admin),
  );

  const alreadyHasAccess = Boolean(integrante?.user_id);

  const handleEmailBlur = (value: string) => {
    if (!value.trim()) return setEmailWarning(null);
    startCheck(async () => {
      const res = await checkIntegranteEmail(value, integrante?.id);
      setEmailWarning(
        res.exists
          ? `Atenção: já existe um integrante com este e-mail (${res.name}).`
          : null,
      );
    });
  };

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nome completo"
          htmlFor="full_name"
          required
          error={state.fieldErrors?.full_name}
        >
          <input
            id="full_name"
            name="full_name"
            defaultValue={integrante?.full_name ?? ""}
            placeholder="Ex.: Maria Silva"
            className={fieldInputClass(Boolean(state.fieldErrors?.full_name))}
          />
        </Field>

        <Field
          label="E-mail"
          htmlFor="email"
          required
          error={state.fieldErrors?.email ?? emailWarning ?? undefined}
          hint={checking ? "Verificando…" : undefined}
        >
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={integrante?.email ?? ""}
            placeholder="maria@exemplo.com"
            onBlur={(e) => handleEmailBlur(e.target.value)}
            className={fieldInputClass(
              Boolean(state.fieldErrors?.email || emailWarning),
            )}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cargo" htmlFor="role_id" hint="Defina os cargos na área “Cargos”.">
          <select
            id="role_id"
            name="role_id"
            defaultValue={integrante?.role_id ?? ""}
            className={fieldInputClass(false)}
          >
            <option value="">Sem cargo</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="LinkedIn" htmlFor="linkedin_url" hint="Opcional.">
          <input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            defaultValue={integrante?.linkedin_url ?? ""}
            placeholder="https://linkedin.com/in/…"
            className={fieldInputClass(false)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Currículo Lattes" htmlFor="lattes_url" hint="Opcional.">
          <input
            id="lattes_url"
            name="lattes_url"
            type="url"
            defaultValue={integrante?.lattes_url ?? ""}
            placeholder="http://lattes.cnpq.br/…"
            className={fieldInputClass(false)}
          />
        </Field>
      </div>

      <Field
        label="Biografia"
        htmlFor="bio"
        hint="Opcional. Aparece no perfil público do integrante."
      >
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={integrante?.bio ?? ""}
          placeholder="Uma breve apresentação"
          className={fieldInputClass(false)}
        />
      </Field>

      <div className="max-w-xs">
        <MediaUploader
          name="avatar_url"
          bucket="avatars"
          kind="image"
          folder="integrantes"
          defaultValue={integrante?.avatar_url}
          label="Foto de perfil"
          hint="Opcional. Será convertida para .webp."
        />
      </div>

      <fieldset className="space-y-3 rounded-xl border border-dark-green/10 bg-cream/60 p-4">
        <legend className="px-1 font-display text-sm font-semibold text-dark-green">
          Situação e acesso
        </legend>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={integrante ? integrante.is_active : true}
            className="mt-0.5 h-4 w-4 accent-moss"
          />
          <span className="font-body text-sm text-ink/80">
            <span className="font-display font-medium text-dark-green">
              Integrante ativo
            </span>
            <br />
            Desmarque para ocultá-lo do site sem excluir.
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="grant_access"
            checked={grantAccess}
            onChange={(e) => setGrantAccess(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-moss"
          />
          <span className="font-body text-sm text-ink/80">
            <span className="flex items-center gap-1.5 font-display font-medium text-dark-green">
              <ShieldCheck className="h-4 w-4" />
              Acesso ao painel do gestor
            </span>
            <br />
            Permite que este integrante entre no painel e gerencie o conteúdo.
          </span>
        </label>

        {grantAccess && !alreadyHasAccess && (
          <Field
            label="Senha inicial"
            htmlFor="password"
            required
            error={state.fieldErrors?.password}
            hint="O integrante poderá alterá-la depois."
          >
            <input
              id="password"
              name="password"
              type="text"
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              className={fieldInputClass(Boolean(state.fieldErrors?.password))}
            />
          </Field>
        )}

        {grantAccess && alreadyHasAccess && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
            Esta conta já possui acesso ao painel.
          </p>
        )}

        {state.fieldErrors?.grant_access && (
          <p className="text-xs font-medium text-red-600">
            {state.fieldErrors.grant_access}
          </p>
        )}
      </fieldset>

      <div className="pt-1">
        <SaveButton label={integrante ? "Salvar alterações" : "Cadastrar integrante"} />
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
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-dark-green px-5 py-2.5 font-display text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-moss hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Salvando…" : label}
    </button>
  );
}
