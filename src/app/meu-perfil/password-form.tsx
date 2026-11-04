"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, Loader2 } from "lucide-react";
import { Field, fieldInputClass } from "@/components/admin/fields";
import { FormMessage } from "@/components/admin/form-message";
import { initialFormState } from "@/lib/admin/types";
import { changeMyPassword } from "./actions";

export function PasswordForm() {
  const [state, action] = useActionState(changeMyPassword, initialFormState);

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nova senha"
          htmlFor="new_password"
          required
          error={state.fieldErrors?.new_password}
        >
          <input
            id="new_password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo de 6 caracteres"
            className={fieldInputClass(Boolean(state.fieldErrors?.new_password))}
          />
        </Field>
        <Field
          label="Confirmar senha"
          htmlFor="confirm_password"
          required
          error={state.fieldErrors?.confirm_password}
        >
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            className={fieldInputClass(Boolean(state.fieldErrors?.confirm_password))}
          />
        </Field>
      </div>

      <ChangeButton />
    </form>
  );
}

function ChangeButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 font-display text-sm font-semibold text-dark-green shadow-sm ring-1 ring-dark-green/15 transition duration-200 hover:bg-cream active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <KeyRound className="h-4 w-4" />
      )}
      {pending ? "Alterando…" : "Alterar senha"}
    </button>
  );
}
