"use server";

import { redirect } from "next/navigation";
import {
  accessToEmail,
  isValidAccess,
  normalizeAccess,
  ACCESS_HINT,
} from "@/lib/access";
import {
  createClient,
  getCurrentProfile,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { errorState, successState, type FormState } from "@/lib/admin/types";
import { slugify } from "@/lib/slugify";

/**
 * Cadastro próprio do integrante.
 *
 * A conta nasce "pendente": sem sessão ativa, sem aparência no site e sem
 * acesso ao painel. É a aprovação do gestor (botão "Aprovar" em
 * /admin/integrantes) que libera o acesso.
 */
export async function signUpIntegrante(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Quem já está logado não precisa se cadastrar.
  const current = await getCurrentProfile();
  if (current) redirect("/meu-perfil");

  if (!isSupabaseConfigured() || !isAdminConfigured()) {
    return errorState(
      "Cadastros ainda não estão abertos. Fale com o gestor do projeto.",
    );
  }

  const errors: Record<string, string> = {};
  const full_name = String(formData.get("full_name") ?? "").trim();
  const access = normalizeAccess(String(formData.get("access") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!full_name) {
    errors.full_name = "Insira o/a nome completo";
  } else if (full_name.length > 120) {
    errors.full_name = "O nome completo precisa ter até 120 caracteres.";
  }

  // No cadastro próprio o acesso não pode ser um e-mail: o gesto de
  // "se registrar com e-mail qualquer" abriria contas fora do domínio interno.
  if (!access) {
    errors.access = "Insira o/a acesso";
  } else if (!isValidAccess(access) || access.includes("@")) {
    errors.access = ACCESS_HINT;
  }

  if (!password) {
    errors.password = "Insira o/a senha";
  } else if (password.length < 6) {
    errors.password = "A senha precisa ter ao menos 6 caracteres.";
  }

  if (confirm !== password) {
    errors.confirm = "As senhas não coincidem.";
  }

  if (Object.keys(errors).length > 0) {
    return errorState("Preencha os campos destacados.", errors);
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const email = accessToEmail(access);

  // Verificação de unicidade com a chave de serviço: a RLS esconde os
  // perfis pendentes do público, então o cliente comum não os enxerga.
  const { data: existing } = await admin.from("profiles").select("access, slug");
  if (
    (existing ?? []).some((p) => normalizeAccess(p.access ?? "") === access)
  ) {
    return errorState("Este acesso já está em uso. Escolha outro.", {
      access: "Este acesso já está em uso. Escolha outro.",
    });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, access } },
  });

  if (error || !data.user) {
    const message = error?.message ?? "";
    if (message.toLowerCase().includes("already")) {
      return errorState("Este acesso já está em uso. Escolha outro.", {
        access: "Este acesso já está em uso. Escolha outro.",
      });
    }
    if (message.toLowerCase().includes("captcha")) {
      return errorState(
        "Não foi possível concluir o cadastro agora. Tente novamente em instantes.",
      );
    }
    return errorState(
      "Não foi possível criar o cadastro. Tente novamente em instantes.",
    );
  }

  // Dependendo da configuração do projeto, o signUp pode devolver uma sessão
  // ativa. Encerra na hora: nada de entrar sem aprovação.
  await supabase.auth.signOut();

  // Slug único consultando TODOS os perfis (service role ignora a RLS).
  const root = slugify(full_name) || "integrante";
  const taken = new Set((existing ?? []).map((p) => p.slug));
  let slug = root;
  let n = 2;
  while (taken.has(slug)) {
    slug = `${root}-${n}`;
    n++;
  }

  const { error: profileError } = await admin.from("profiles").insert({
    full_name,
    access,
    email: null,
    slug,
    user_id: data.user.id,
    role_id: null,
    bio: null,
    avatar_url: null,
    linkedin_url: null,
    lattes_url: null,
    website_url: null,
    status: "pending",
    is_active: true,
    is_admin: false,
  });

  if (profileError) {
    // Sem perfil, o cadastro fica órfão: remove a conta recém-criada.
    try {
      await admin.auth.admin.deleteUser(data.user.id);
    } catch {
      // best-effort
    }
    return errorState(
      "Não foi possível concluir o cadastro. Tente novamente em instantes.",
    );
  }

  return successState(
    "Cadastro enviado. Aguarde a aprovação do gestor.",
  );
}
