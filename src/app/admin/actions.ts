"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { errorState, type FormState } from "@/lib/admin/types";

const AUTH_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme o seu e-mail antes de entrar.",
  "Too many requests": "Muitas tentativas. Aguarde alguns instantes.",
};

export async function signIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    return errorState(
      "Supabase ainda não configurado. Preencha o arquivo .env.local e reinicie o servidor.",
    );
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!email) fieldErrors.email = "Insira o/a e-mail";
  if (!password) fieldErrors.password = "Insira o/a senha";
  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Preencha os campos destacados.", fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return errorState(
      AUTH_MESSAGES[error.message] ??
        "Não foi possível entrar. Verifique seus dados e tente novamente.",
    );
  }

  const redirectTo = String(formData.get("redirectTo") ?? "/admin");
  redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
