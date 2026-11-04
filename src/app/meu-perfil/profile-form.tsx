"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { AvatarUploader } from "@/components/avatar-uploader";
import { Field, fieldInputClass } from "@/components/admin/fields";
import { FormMessage } from "@/components/admin/form-message";
import { initialFormState } from "@/lib/admin/types";
import type { Tables } from "@/lib/database.types";
import { updateMyProfile } from "./actions";

type Perfil = Tables<"profiles">;

export function ProfileForm({
  profile,
  roles,
  userId,
}: {
  profile: Perfil;
  roles: Pick<Tables<"roles">, "id" | "name">[];
  userId: string;
}) {
  const [state, action] = useActionState(updateMyProfile, initialFormState);

  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />

      <AvatarUploader
        name="avatar_url"
        userId={userId}
        defaultValue={profile.avatar_url}
      />

      <Field
        label="Nome"
        htmlFor="full_name"
        required
        error={state.fieldErrors?.full_name}
      >
        <input
          id="full_name"
          name="full_name"
          defaultValue={profile.full_name}
          placeholder="Como você quer aparecer no site"
          className={fieldInputClass(Boolean(state.fieldErrors?.full_name))}
        />
      </Field>

      <Field
        label="Cargo"
        htmlFor="role_id"
        hint="Opcional."
      >
        <select
          id="role_id"
          name="role_id"
          defaultValue={profile.role_id ?? ""}
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

      <Field
        label="Descrição"
        htmlFor="bio"
        hint="Opcional."
      >
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile.bio ?? ""}
          placeholder="Fale um pouco sobre a sua atuação…"
          className={fieldInputClass(false)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="LinkedIn" htmlFor="linkedin_url" hint="Opcional.">
          <input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            defaultValue={profile.linkedin_url ?? ""}
            placeholder="https://linkedin.com/in/…"
            className={fieldInputClass(false)}
          />
        </Field>
        <Field label="Lattes" htmlFor="lattes_url" hint="Opcional.">
          <input
            id="lattes_url"
            name="lattes_url"
            type="url"
            defaultValue={profile.lattes_url ?? ""}
            placeholder="http://lattes.cnpq.br/…"
            className={fieldInputClass(false)}
          />
        </Field>
        <Field label="Site / contato" htmlFor="website_url" hint="Opcional.">
          <input
            id="website_url"
            name="website_url"
            type="url"
            defaultValue={profile.website_url ?? ""}
            placeholder="https://…"
            className={fieldInputClass(false)}
          />
        </Field>
      </div>

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-dark-green px-5 py-2.5 font-display text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-moss hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {pending ? "Salvando…" : "Salvar perfil"}
    </button>
  );
}
