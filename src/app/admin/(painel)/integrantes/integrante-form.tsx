"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, Loader2 } from "lucide-react";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Field, fieldInputClass } from "@/components/admin/fields";
import { FormMessage } from "@/components/admin/form-message";
import { AccessInput } from "@/components/access-input";
import { PasswordInput } from "@/components/password-input";
import { initialFormState } from "@/lib/admin/types";
import { ACCESS_HINT } from "@/lib/access";
import type { ProfileStatus, Tables } from "@/lib/database.types";
import {
  checkIntegranteAccess,
  createIntegrante,
  updateIntegrante,
} from "./actions";

type Integrante = Tables<"profiles">;

const STATUS_OPTIONS: { value: ProfileStatus; label: string }[] = [
  { value: "pending", label: "Pendente (não aparece no site)" },
  { value: "approved", label: "Aprovado (aparece no site)" },
  { value: "inactive", label: "Inativo (oculto, sem excluir)" },
];

export function IntegranteForm({
  integrante,
  roles,
  isSelf = false,
}: {
  integrante?: Integrante;
  roles: Pick<Tables<"roles">, "id" | "name">[];
  isSelf?: boolean;
}) {
  const action = integrante
    ? updateIntegrante.bind(null, integrante.id)
    : createIntegrante;
  const [state, formAction] = useActionState(action, initialFormState);

  const [accessWarning, setAccessWarning] = useState<string | null>(null);
  const [checking, startCheck] = useTransition();
  const alreadyHasAccess = Boolean(integrante?.user_id);
  const [grantAccess, setGrantAccess] = useState(
    alreadyHasAccess || isSelf,
  );

  const handleAccessBlur = (value: string) => {
    if (!value.trim()) return setAccessWarning(null);
    startCheck(async () => {
      const res = await checkIntegranteAccess(value, integrante?.id);
      setAccessWarning(
        res.exists
          ? `Atenção: já existe um integrante com este acesso (${res.name}).`
          : null,
      );
    });
  };

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />

      {isSelf && (
        <p className="rounded-xl bg-moss/10 px-4 py-3 font-body text-sm text-dark-green ring-1 ring-moss/25">
          Você está editando o seu próprio perfil de <strong>gestor master</strong>.
          O seu acesso e a sua permissão de administrador não podem ser removidos
          por aqui.
        </p>
      )}

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
          label="Acesso"
          htmlFor="access"
          error={state.fieldErrors?.access ?? accessWarning ?? undefined}
          hint={checking ? "Verificando…" : "Nome usado para entrar (login)."}
        >
          <AccessInput
            id="access"
            name="access"
            defaultValue={integrante?.access ?? ""}
            placeholder="maria.silva"
            invalid={Boolean(state.fieldErrors?.access || accessWarning)}
            className={fieldInputClass(
              Boolean(state.fieldErrors?.access || accessWarning),
            )}
            onBlur={(value) => handleAccessBlur(value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cargo" htmlFor="role_id">
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

        <Field label="Site / contato" htmlFor="website_url" hint="Opcional.">
          <input
            id="website_url"
            name="website_url"
            type="url"
            defaultValue={integrante?.website_url ?? ""}
            placeholder="https://…"
            className={fieldInputClass(false)}
          />
        </Field>
      </div>

      <Field
        label="Biografia"
        htmlFor="bio"
        hint="Opcional."
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
          hint="Opcional."
        />
      </div>

      <fieldset className="space-y-3 rounded-xl border border-dark-green/10 bg-cream/60 p-4">
        <legend className="px-1 font-display text-sm font-semibold text-dark-green">
          Situação e acesso
        </legend>

        <Field
          label="Situação do perfil"
          htmlFor="status"
        >
          <select
            id="status"
            name="status"
            defaultValue={isSelf ? "approved" : (integrante?.status ?? "approved")}
            disabled={isSelf}
            className={fieldInputClass(false)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {isSelf && <input type="hidden" name="status" value="approved" />}
        </Field>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="grant_access"
            checked={grantAccess}
            onChange={(e) => setGrantAccess(e.target.checked)}
            disabled={isSelf}
            className="mt-0.5 h-4 w-4 accent-moss disabled:opacity-60"
          />
          <span className="font-body text-sm text-ink/80">
            <span className="flex items-center gap-1.5 font-display font-medium text-dark-green">
              <KeyRound className="h-4 w-4" />
              Dar acesso (login próprio)
            </span>
            <br />
            O integrante entra com o “acesso” e a senha para personalizar o
            próprio perfil. <strong>Não</strong> dá acesso ao painel do gestor.
          </span>
        </label>

        {grantAccess && !alreadyHasAccess && !isSelf && (
          <Field
            label="Senha inicial"
            htmlFor="password"
            required
            error={state.fieldErrors?.password}
          >
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              invalid={Boolean(state.fieldErrors?.password)}
              className={fieldInputClass(Boolean(state.fieldErrors?.password))}
            />
          </Field>
        )}

        {grantAccess && alreadyHasAccess && (
          <Field
            label="Redefinir senha"
            htmlFor="password"
            error={state.fieldErrors?.password}
            hint="Deixe em branco para manter a senha atual."
          >
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="Nova senha (opcional)"
              invalid={Boolean(state.fieldErrors?.password)}
              className={fieldInputClass(Boolean(state.fieldErrors?.password))}
            />
          </Field>
        )}

        {alreadyHasAccess && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
            Este integrante já possui acesso. O “acesso” acima é o nome de login
            dele.
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
