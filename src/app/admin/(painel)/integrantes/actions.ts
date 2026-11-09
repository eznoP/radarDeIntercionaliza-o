"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  accessToEmail,
  isValidAccess,
  normalizeAccess,
  ACCESS_HINT,
} from "@/lib/access";
import { requireAdmin } from "@/lib/admin/auth";
import { dbErrorMessage } from "@/lib/admin/errors";
import { errorState, type FormState } from "@/lib/admin/types";
import { checkbox, optionalText, requiredText } from "@/lib/admin/validation";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import type { ProfileStatus } from "@/lib/database.types";

const LIST_PATH = "/admin/integrantes";
const STATUSES: ProfileStatus[] = ["pending", "approved", "inactive"];

function readForm(formData: FormData) {
  const errors: Record<string, string> = {};
  const full_name = requiredText(formData, "full_name", "nome completo", errors);

  const access = normalizeAccess(optionalText(formData, "access"));
  const grant_access = checkbox(formData, "grant_access");
  const password = String(formData.get("password") ?? "");

  if (access && !isValidAccess(access)) {
    errors.access = ACCESS_HINT;
  }
  if (grant_access && !access) {
    errors.access = "Insira o/a acesso";
  }
  if (password && password.length < 6) {
    errors.password = "A senha precisa ter ao menos 6 caracteres.";
  }

  const role_id = optionalText(formData, "role_id");
  const bio = optionalText(formData, "bio");
  const avatar_url = optionalText(formData, "avatar_url");
  const linkedin_url = optionalText(formData, "linkedin_url");
  const lattes_url = optionalText(formData, "lattes_url");
  const website_url = optionalText(formData, "website_url");

  const rawStatus = optionalText(formData, "status") as ProfileStatus;
  const status: ProfileStatus = STATUSES.includes(rawStatus)
    ? rawStatus
    : "pending";

  return {
    errors,
    full_name,
    access,
    grant_access,
    password,
    role_id,
    bio,
    avatar_url,
    linkedin_url,
    lattes_url,
    website_url,
    status,
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

/**
 * Garante que existe uma conta de autenticação para o acesso informado.
 * Cria a conta (e-mail interno derivado) ou atualiza a existente.
 */
async function ensureAuthUser({
  access,
  password,
  existingUserId,
}: {
  access: string;
  password?: string;
  existingUserId?: string | null;
}): Promise<{ userId?: string; error?: string }> {
  if (!isAdminConfigured()) {
    return {
      error:
        "Para criar o acesso do integrante é preciso configurar SUPABASE_SERVICE_ROLE_KEY no .env.local.",
    };
  }

  const admin = createAdminClient();
  const email = accessToEmail(access);

  if (existingUserId) {
    const { error } = await admin.auth.admin.updateUserById(existingUserId, {
      email,
      ...(password ? { password } : {}),
      email_confirm: true,
    });
    if (error) {
      return { error: `Não foi possível atualizar o acesso: ${error.message}` };
    }
    return { userId: existingUserId };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: password || crypto.randomUUID(),
    email_confirm: true,
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      const { data: list, error: listError } = await admin.auth.admin.listUsers();
      if (!listError) {
        const found = list.users.find((u) => u.email?.toLowerCase() === email);
        if (found) return { userId: found.id };
      }
      return {
        error:
          "Já existe um acesso com este nome, mas não foi possível localizá-lo.",
      };
    }
    return { error: `Não foi possível criar o acesso: ${error.message}` };
  }
  return { userId: data.user?.id };
}

/** Revoga (exclui) a conta de autenticação vinculada. */
async function revokeAuthUser(userId: string) {
  if (!isAdminConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(userId);
  } catch {
    // Não impede a edição do perfil.
  }
}

/** Verifica, em tempo real no formulário, se o acesso já está em uso. */
export async function checkIntegranteAccess(
  access: string,
  ignoreId?: string,
): Promise<{ exists: boolean; name?: string }> {
  const value = normalizeAccess(access);
  if (!value) return { exists: false };
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, full_name, access");
  const found = (data ?? []).find(
    (p) => p.id !== ignoreId && normalizeAccess(p.access ?? "") === value,
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
  const { data: existing } = await supabase.from("profiles").select("id, access");
  if (
    f.access &&
    (existing ?? []).some(
      (p) => normalizeAccess(p.access ?? "") === f.access,
    )
  ) {
    return errorState("Já existe um integrante com este acesso.", {
      access: "Já existe um integrante com este acesso.",
    });
  }

  if (f.grant_access && !f.password) {
    return errorState("Defina uma senha inicial para liberar o acesso.", {
      password: "Insira o/a senha inicial",
    });
  }

  let userId: string | null = null;
  if (f.grant_access) {
    const resolved = await ensureAuthUser({
      access: f.access,
      password: f.password,
    });
    if (resolved.error) {
      return errorState(resolved.error, { grant_access: resolved.error });
    }
    userId = resolved.userId ?? null;
  }

  const slug = await uniqueProfileSlug(f.full_name);
  const { error } = await supabase.from("profiles").insert({
    full_name: f.full_name,
    access: f.access || null,
    email: null,
    slug,
    user_id: userId,
    role_id: f.role_id || null,
    bio: f.bio || null,
    avatar_url: f.avatar_url || null,
    linkedin_url: f.linkedin_url || null,
    lattes_url: f.lattes_url || null,
    website_url: f.website_url || null,
    status: f.status,
    is_active: f.status !== "inactive",
    is_admin: false,
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
  const me = await requireAdmin();
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

  const isSelf = current.id === me.profile?.id;

  const { data: all } = await supabase.from("profiles").select("id, access");
  if (
    f.access &&
    (all ?? []).some(
      (p) => p.id !== id && normalizeAccess(p.access ?? "") === f.access,
    )
  ) {
    return errorState("Já existe um integrante com este acesso.", {
      access: "Já existe um integrante com este acesso.",
    });
  }

  let userId = current.user_id;

  if (f.grant_access) {
    const accessChanged = f.access && f.access !== normalizeAccess(current.access ?? "");
    if (!userId && !f.password) {
      return errorState("Defina uma senha inicial para liberar o acesso.", {
        password: "Insira o/a senha inicial",
      });
    }
    if (!userId || accessChanged || f.password) {
      const resolved = await ensureAuthUser({
        access: f.access,
        password: f.password,
        existingUserId: userId,
      });
      if (resolved.error) {
        return errorState(resolved.error, { grant_access: resolved.error });
      }
      userId = resolved.userId ?? null;
    }
  } else if (userId && !isSelf) {
    // Acesso revogado: remove a conta de autenticação vinculada.
    await revokeAuthUser(userId);
    userId = null;
  }

  const slug = await uniqueProfileSlug(f.full_name, id);

  // Protege a conta do gestor master: nunca se rebaixa nem se desativa.
  const status: ProfileStatus = isSelf ? "approved" : f.status;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: f.full_name,
      access: f.grant_access
        ? f.access || null
        : isSelf
          ? current.access
          : null,
      slug,
      user_id: userId,
      role_id: f.role_id || null,
      bio: f.bio || null,
      avatar_url: f.avatar_url || null,
      linkedin_url: f.linkedin_url || null,
      lattes_url: f.lattes_url || null,
      website_url: f.website_url || null,
      status,
      is_active: status !== "inactive",
    })
    .eq("id", id);
  if (error) return errorState(dbErrorMessage(error));

  // Aprovação pelo formulário: confirma o e-mail interno para liberar o login
  // de cadastros auto-registrados que ainda não conseguem autenticar.
  if (status === "approved" && userId) {
    const authError = await confirmAuthEmail(
      userId,
      f.access || normalizeAccess(current.access ?? ""),
    );
    if (authError) {
      redirect(
        `${LIST_PATH}?erro=${encodeURIComponent(
          `Integrante atualizado, mas houve um problema para liberar o login: ${authError}.`,
        )}`,
      );
    }
  }

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");
  revalidatePath("/integrantes");
  redirect(
    `${LIST_PATH}?ok=${encodeURIComponent("Integrante atualizado com sucesso.")}`,
  );
}

/**
 * Confirma o e-mail interno de um cadastro auto-registrado.
 * Sem isso o Supabase Auth recusa a autenticação ("e-mail não confirmado")
 * mesmo com o perfil já aprovado — o login só libera depois desta etapa.
 * Retorna null em caso de sucesso ou a descrição do problema.
 */
async function confirmAuthEmail(
  userId: string,
  access: string | null,
): Promise<string | null> {
  if (!userId) return null;
  if (!isAdminConfigured()) {
    return "o login exige a SUPABASE_SERVICE_ROLE_KEY configurada";
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ...(access ? { email: accessToEmail(access) } : {}),
    email_confirm: true,
  });
  return error
    ? `não foi possível liberar o login: ${error.message}`
    : null;
}

/** Aprova um perfil pendente com um clique. */
export async function approveIntegrante(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("access, user_id, status")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("profiles")
    .update({ status: "approved", is_active: true })
    .eq("id", id);

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");
  revalidatePath("/integrantes");

  if (error) {
    redirect(`${LIST_PATH}?erro=${encodeURIComponent(dbErrorMessage(error))}`);
  }

  // Cadastro auto-registrado: aprovar também significa liberar o login.
  if (target?.user_id && target.status === "pending") {
    const authError = await confirmAuthEmail(target.user_id, target.access);
    if (authError) {
      redirect(
        `${LIST_PATH}?erro=${encodeURIComponent(
          `Perfil aprovado, mas houve um problema para liberar o login: ${authError}.`,
        )}`,
      );
    }
  }

  redirect(
    `${LIST_PATH}?ok=${encodeURIComponent("Perfil aprovado e publicado no site.")}`,
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
  if (target?.user_id) {
    await revokeAuthUser(target.user_id);
  }

  redirect(`${LIST_PATH}?ok=${encodeURIComponent("Integrante excluído.")}`);
}
