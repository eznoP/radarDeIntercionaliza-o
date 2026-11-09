"use client";

import { useActionState } from "react";
import { CircleCheck } from "lucide-react";
import { signUpIntegrante } from "@/app/cadastro/actions";
import { initialFormState } from "@/lib/admin/types";
import { AccessInput } from "@/components/access-input";
import { PasswordInput } from "@/components/password-input";
import { cn } from "@/lib/utils";

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border border-dark-green/15 bg-cream px-4 py-3 font-body text-sm text-ink outline-none transition",
    "placeholder:text-ink/35 focus:ring-2 focus:ring-moss/40 focus:border-moss",
    hasError ? "border-red-400 focus:border-red-400" : "",
  ].join(" ");
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-red-600">{message}</p>;
}

export function SignupForm() {
  const [state, action, pending] = useActionState(
    signUpIntegrante,
    initialFormState,
  );

  if (state.status === "success") {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
          <CircleCheck className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display text-lg font-semibold text-dark-green">
            Acesso solicitado
          </h2>
          <p className="font-body text-sm text-ink/60">{state.message}</p>
        </div>
        <p className="font-body text-xs text-ink/50">
          <a href="/admin/login" className="underline-offset-2 hover:underline">
            Voltar para o login
          </a>
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label
          htmlFor="full_name"
          className="font-display text-sm font-medium text-dark-green"
        >
          Nome completo
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          placeholder="Como você aparece no site"
          aria-invalid={Boolean(state.fieldErrors?.full_name)}
          className={inputClass(Boolean(state.fieldErrors?.full_name))}
        />
        <FieldError message={state.fieldErrors?.full_name} />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="access"
          className="font-display text-sm font-medium text-dark-green"
        >
          Acesso
        </label>
        <AccessInput
          id="access"
          name="access"
          placeholder="acesso123"
          invalid={Boolean(state.fieldErrors?.access)}
          className={inputClass(Boolean(state.fieldErrors?.access))}
        />
        <FieldError message={state.fieldErrors?.access} />
        <p className="font-body text-xs text-ink/50">
          Ex.: <span className="text-ink/70">acesso123</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="font-display text-sm font-medium text-dark-green"
          >
            Senha
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={Boolean(state.fieldErrors?.password)}
            className={inputClass(Boolean(state.fieldErrors?.password))}
          />
          <FieldError message={state.fieldErrors?.password} />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirm"
            className="font-display text-sm font-medium text-dark-green"
          >
            Confirmar a senha
          </label>
          <PasswordInput
            id="confirm"
            name="confirm"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={Boolean(state.fieldErrors?.confirm)}
            className={inputClass(Boolean(state.fieldErrors?.confirm))}
          />
          <FieldError message={state.fieldErrors?.confirm} />
        </div>
      </div>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex w-full items-center justify-center rounded-xl bg-dark-green px-6 py-3.5 font-display text-sm font-semibold text-white shadow-sm transition duration-200",
          "hover:bg-moss hover:shadow-lg active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {pending ? "Enviando…" : "Solicitar o acesso"}
      </button>
    </form>
  );
}
