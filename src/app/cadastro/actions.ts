"use server";

import { redirect } from "next/navigation";
import {
  accessToEmail,
  isValidAccess,
  normalizeAccess,
  ACCESS_HINT,
} from "@/lib/access";
import {
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

  // Cria a conta direto pela chave de serviço, sem e-mail de confirmação:
  // o SMTP nativo do Supabase limita os envios a poucos por hora — e o
  // e-mail interno nunca é entregue de qualquer forma; quem libera o
  // acesso é a aprovação do gestor.
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name, access },
  });

  let user = created?.user;

  if (error && error.message.toLowerCase().includes("already")) {
    // A conta pode ter ficado órfã de uma tentativa anterior (erro no
    // insert do perfil): se ela existe sem perfil, reaproveita-a.
    const { data: orphan } = await admin
      .from("profiles")
      .select("access")
      .eq("access", access)
      .maybeSingle();
    if (orphan) {
      return errorState("Este acesso já está em uso. Escolha outro.", {
        access: "Este acesso já está em uso. Escolha outro.",
      });
    }
    let page = 1;
    while (!user) {
      const { data: listed } = await admin.auth.admin.listUsers({
        page: page++,
        perPage: 200,
      });
      if (!listed || listed.users.length === 0) break;
      user =
        listed.users.find((u) => u.email?.toLowerCase() === email) ?? null;
      if (page > 50) break;
    }
    if (!user) {
      return errorState("Este acesso já está em uso. Escolha outro.", {
        access: "Este acesso já está em uso. Escolha outro.",
      });
    }
  } else if (error || !user) {
    console.error("[signup] createUser falhou:", error?.message ?? "sem usuário");
    return errorState(
      "Não foi possível criar o cadastro. Tente novamente em instantes.",
    );
  }

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
    user_id: user.id,
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
    console.error("[signup] insert profiles falhou:", profileError.message);
    // Sem perfil, o cadastro fica órfão: remove a conta recém-criada.
    try {
      await admin.auth.admin.deleteUser(user.id);
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
