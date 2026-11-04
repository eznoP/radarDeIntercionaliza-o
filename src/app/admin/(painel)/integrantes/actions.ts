"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { dbErrorMessage } from "@/lib/admin/errors";
import { errorState, type FormState } from "@/lib/admin/types";
import { checkbox, optionalText, requiredText } from "@/lib/admin/validation";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

const LIST_PATH = "/admin/integrantes";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readForm(formData: FormData) {
  const errors: Record<string, string> = {};
  const full_name = requiredText(formData, "full_name", "nome completo", errors);
  const email = requiredText(formData, "email", "e-mail", errors).toLowerCase();
  if (email && !EMAIL_RE.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  const role_id = optionalText(formData, "role_id");
  const bio = optionalText(formData, "bio");
  const avatar_url = optionalText(formData, "avatar_url");
  const linkedin_url = optionalText(formData, "linkedin_url");
  const lattes_url = optionalText(formData, "lattes_url");
  const is_active = checkbox(formData, "is_active");
  const grant_access = checkbox(formData, "grant_access");
  const password = String(formData.get("password") ?? "");

  if (grant_access && password && password.length < 6) {
    errors.password = "A senha precisa ter ao menos 6 caracteres.";
  }

  return {
    errors,
    full_name,
    email,
    role_id,
    bio,
    avatar_url,
    linkedin_url,
    lattes_url,
    is_active,
    grant_access,
    password,
  };
}

async function uniqueProfileSlug(base: string, ignoreId?: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, slug");
  const taken = new Set(
    (data ?? []).filter((p) => p.id !== ignoreId).map((p) => p.slug),
  );
  const root = slugify(base) || "integrante";
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

/** Cria (ou localiza) a conta de autenticação e devolve o user_id. */
async function resolveUserId(
  email: string,
  password: string,
): Promise<{ userId?: string; error?: string }> {
  if (!isAdminConfigured()) {
    return {
      error:
        "Para dar acesso ao painel é preciso configurar SUPABASE_SERVICE_ROLE_KEY no .env.local.",
    };
  }
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: password || crypto.randomUUID(),
    email_confirm: true,
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      const { data: list, error: listError } = await admin.auth.admin.listUsers();
      if (!listError) {
        const found = list.users.find(
          (u) => u.email?.toLowerCase() === email,
        );
        if (found) return { userId: found.id };
      }
      return {
        error:
          "Já existe uma conta de acesso com este e-mail, mas não foi possível localizá-la.",
      };
    }
    return {
      error: `Não foi possível criar a conta de acesso: ${error.message}`,
    };
  }
  return { userId: data.user?.id };
}

/** Verifica, em tempo real no formulário, se já existe um integrante com o e-mail. */
export async function checkIntegranteEmail(
  email: string,
  ignoreId?: string,
): Promise<{ exists: boolean; name?: string }> {
  const value = email.trim().toLowerCase();
  if (!value || !EMAIL_RE.test(value)) return { exists: false };
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, full_name, email");
  const found = (data ?? []).find(
    (p) => p.id !== ignoreId && p.email?.toLowerCase() === value,
  );
  return found ? { exists: true, name: found.full_name } : { exists: false };
}

export async function createIntegrante(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const f = readForm(formData);
  if (Object.keys(f.errors).length) {
    return errorState("Preencha os campos destacados.", f.errors);
  }

  const supabase = await createClient();
  const { data: existing } = await supabase.from("profiles").select("id, email");
  if ((existing ?? []).some((p) => p.email?.toLowerCase() === f.email)) {
    return errorState("Já existe um integrante com este e-mail.", {
      email: "Já existe um integrante com este e-mail.",
    });
  }

  if (f.grant_access && !f.password) {
    return errorState("Defina uma senha inicial para liberar o acesso.", {
      password: "Insira o/a senha inicial",
    });
  }

  let userId: string | null = null;
  if (f.grant_access) {
    const resolved = await resolveUserId(f.email, f.password);
    if (resolved.error) {
      return errorState(resolved.error, { grant_access: resolved.error });
    }
    userId = resolved.userId ?? null;
  }

  const slug = await uniqueProfileSlug(f.full_name);
  const { error } = await supabase.from("profiles").insert({
    full_name: f.full_name,
    email: f.email,
    slug,
    user_id: userId,
    role_id: f.role_id || null,
    bio: f.bio || null,
    avatar_url: f.avatar_url || null,
    linkedin_url: f.linkedin_url || null,
    lattes_url: f.lattes_url || null,
    is_active: f.is_active,
    is_admin: f.grant_access,
  });
  if (error) return errorState(dbErrorMessage(error));

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");
  revalidatePath("/integrantes");
  redirect(
    `${LIST_PATH}?ok=${encodeURIComponent("Integrante cadastrado com sucesso.")}`,
  );
}

export async function updateIntegrante(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const f = readForm(formData);
  if (Object.keys(f.errors).length) {
    return errorState("Preencha os campos destacados.", f.errors);
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!current) return errorState("Integrante não encontrado.");

  const { data: all } = await supabase.from("profiles").select("id, email");
  if (
    (all ?? []).some(
      (p) => p.id !== id && p.email?.toLowerCase() === f.email,
    )
  ) {
    return errorState("Já existe um integrante com este e-mail.", {
      email: "Já existe um integrante com este e-mail.",
    });
  }

  let userId = current.user_id;
  if (f.grant_access && !userId) {
    if (!f.password) {
      return errorState("Defina uma senha inicial para liberar o acesso.", {
        password: "Insira o/a senha inicial",
      });
    }
    const resolved = await resolveUserId(f.email, f.password);
    if (resolved.error) {
      return errorState(resolved.error, { grant_access: resolved.error });
    }
    userId = resolved.userId ?? null;
  }

  const slug = await uniqueProfileSlug(f.full_name, id);
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: f.full_name,
      email: f.email,
      slug,
      user_id: userId,
      role_id: f.role_id || null,
      bio: f.bio || null,
      avatar_url: f.avatar_url || null,
      linkedin_url: f.linkedin_url || null,
      lattes_url: f.lattes_url || null,
      is_active: f.is_active,
      is_admin: f.grant_access,
    })
    .eq("id", id);
  if (error) return errorState(dbErrorMessage(error));

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");
  revalidatePath("/integrantes");
  redirect(
    `${LIST_PATH}?ok=${encodeURIComponent("Integrante atualizado com sucesso.")}`,
  );
}

export async function deleteIntegrante(id: string): Promise<void> {
  const { profile: me } = await requireAdmin();
  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("id, user_id, full_name")
    .eq("id", id)
    .maybeSingle();

  if (target && target.id === me?.id) {
    redirect(
      `${LIST_PATH}?erro=${encodeURIComponent("Você não pode excluir o seu próprio perfil.")}`,
    );
  }

  const { error } = await supabase.from("profiles").delete().eq("id", id);

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");
  revalidatePath("/integrantes");

  if (error) {
    redirect(`${LIST_PATH}?erro=${encodeURIComponent(dbErrorMessage(error))}`);
  }

  // Remove a conta de acesso vinculada (se houver e não for a sua).
  if (target?.user_id && isAdminConfigured()) {
    try {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(target.user_id);
    } catch {
      // Não impede a exclusão do perfil.
    }
  }

  redirect(`${LIST_PATH}?ok=${encodeURIComponent("Integrante excluído.")}`);
}
