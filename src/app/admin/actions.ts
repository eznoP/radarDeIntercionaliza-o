"use server";

import { redirect } from "next/navigation";
import { accessToEmail } from "@/lib/access";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { errorState, type FormState } from "@/lib/admin/types";

const AUTH_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Acesso ou senha incorretos.",
  "Email not confirmed": "Confirme o seu acesso antes de entrar.",
  "Too many requests": "Muitas tentativas. Aguarde alguns instantes.",
};

export async function signIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    return errorState(
      "Supabase ainda não configurado. Fale com o gestor do projeto.",
    );
  }

  const access = String(formData.get("access") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!access) fieldErrors.access = "Insira o/a acesso";
  if (!password) fieldErrors.password = "Insira o/a senha";
  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Preencha os campos destacados.", fieldErrors);
  }

  const email = accessToEmail(access);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return errorState(
      AUTH_MESSAGES[error?.message ?? ""] ??
        "Não foi possível entrar. Verifique seus dados e tente novamente.",
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, status")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (profile?.status === "inactive") {
    await supabase.auth.signOut();
    return errorState(
      "Este acesso está inativo. Fale com o gestor do projeto para reativá-lo.",
    );
  }

  const requested = String(formData.get("redirectTo") ?? "");
  const safeRequested =
    requested.startsWith("/admin") && requested !== "/admin/login"
      ? requested
      : null;

  // Gestor master -> painel. Integrante aprovado -> painel (escopo próprio).
  // Pendentes/inativos -> área do próprio perfil.
  if (profile?.is_admin) {
    redirect(safeRequested ?? "/admin");
  }

  if (profile?.status === "approved") {
    redirect(safeRequested ?? "/admin");
  }

  redirect("/meu-perfil");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
