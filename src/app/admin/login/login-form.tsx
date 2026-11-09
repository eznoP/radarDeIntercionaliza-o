"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/actions";
import { initialFormState } from "@/lib/admin/types";
import { AccessInput } from "@/components/access-input";
import { PasswordInput } from "@/components/password-input";
import { cn } from "@/lib/utils";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(signIn, initialFormState);

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo ?? "/admin"} />

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
          placeholder="joao.silva"
          invalid={Boolean(state.fieldErrors?.access)}
          className={cn(
            "w-full rounded-xl border bg-white px-4 py-3 font-body text-sm text-ink outline-none transition",
            "placeholder:text-ink/35 focus:ring-2 focus:ring-moss/40",
            state.fieldErrors?.access
              ? "border-red-400 focus:border-red-400"
              : "border-dark-green/15 focus:border-moss",
          )}
        />
        {state.fieldErrors?.access && (
          <p className="text-xs font-medium text-red-600">
            {state.fieldErrors.access}
          </p>
        )}
      </div>

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
          placeholder="••••••••"
          invalid={Boolean(state.fieldErrors?.password)}
          className={cn(
            "w-full rounded-xl border bg-white px-4 py-3 font-body text-sm text-ink outline-none transition",
            "placeholder:text-ink/35 focus:ring-2 focus:ring-moss/40",
            state.fieldErrors?.password
              ? "border-red-400 focus:border-red-400"
              : "border-dark-green/15 focus:border-moss",
          )}
        />
        {state.fieldErrors?.password && (
          <p className="text-xs font-medium text-red-600">
            {state.fieldErrors.password}
          </p>
        )}
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
        className="inline-flex w-full items-center justify-center rounded-xl bg-dark-green px-6 py-3.5 font-display text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-moss hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
