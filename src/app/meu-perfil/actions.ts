"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  errorState,
  successState,
  type FormState,
} from "@/lib/admin/types";
import { optionalText, requiredText } from "@/lib/admin/validation";
import {
  FUNCAO_VALUES,
  type MemberFuncao,
} from "@/lib/member-funcao";

const PROFILE_PATH = "/meu-perfil";

/** Valida uma URL opcional (só http/https). */
function readUrl(formData: FormData, field: string): string {
  const value = optionalText(formData, field);
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : "";
}

export async function updateMyProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    return errorState("Supabase ainda não configurado. Fale com o gestor.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return errorState("A sua sessão expirou. Entre novamente.");
  }

  const errors: Record<string, string> = {};
  const full_name = requiredText(formData, "full_name", "nome", errors);
  const role_id = optionalText(formData, "role_id");
  const bio = optionalText(formData, "bio");
  const avatar_url = optionalText(formData, "avatar_url");
  const linkedin_url = readUrl(formData, "linkedin_url");
  const lattes_url = readUrl(formData, "lattes_url");

  const portfolio_email = optionalText(formData, "portfolio_email");
  if (portfolio_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(portfolio_email)) {
    errors.portfolio_email = "Insira um e-mail válido.";
  }

  const funcaoRaw = optionalText(formData, "funcao") as MemberFuncao;
  const funcao: MemberFuncao | null = FUNCAO_VALUES.includes(funcaoRaw)
    ? funcaoRaw
    : null;

  if (Object.keys(errors).length) {
    return errorState("Preencha os campos destacados.", errors);
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      role_id: role_id || null,
      bio: bio || null,
      avatar_url: avatar_url || null,
      linkedin_url: linkedin_url || null,
      lattes_url: lattes_url || null,
      portfolio_email: portfolio_email || null,
      funcao: funcao,
    })
    .eq("user_id", user.id);

  if (error) {
    return errorState(
      "Não foi possível salvar o seu perfil. Tente novamente em instantes.",
    );
  }

  revalidatePath(PROFILE_PATH);
  revalidatePath("/integrantes");
  return successState(
    "Perfil salvo! Se você alterou dados que aparecem no site, o gestor precisa aprovar.",
  );
}

export async function changeMyPassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    return errorState("Supabase ainda não configurado. Fale com o gestor.");
  }

  const password = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  const errors: Record<string, string> = {};
  if (!password) errors.new_password = "Insira o/a nova senha";
  else if (password.length < 6)
    errors.new_password = "A senha precisa ter ao menos 6 caracteres.";
  if (confirm !== password) errors.confirm_password = "As senhas não conferem.";
  if (Object.keys(errors).length) {
    return errorState("Verifique os campos destacados.", errors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return errorState("Não foi possível alterar a senha. Tente novamente.");
  }
  return successState("Senha alterada com sucesso.");
}
