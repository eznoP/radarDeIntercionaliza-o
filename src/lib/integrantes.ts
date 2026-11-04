import "server-only";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/** Integrante já aprovado, no formato exibido na página pública. */
export type IntegrantePublico = {
  id: string;
  slug: string;
  fullName: string;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  lattesUrl: string | null;
  websiteUrl: string | null;
};

/**
 * Integrantes aprovados para a página pública.
 * A RLS já garante que só perfis com status "approved" são visíveis;
 * o filtro reforça a intenção e esconde a conta do gestor.
 */
export async function getApprovedIntegrantes(): Promise<IntegrantePublico[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, slug, full_name, bio, avatar_url, linkedin_url, lattes_url, website_url, role_id, is_admin, status",
      )
      .eq("status", "approved")
      .eq("is_admin", false)
      .order("full_name", { ascending: true });

    if (error) return [];

    const { data: roles } = await supabase.from("roles").select("id, name");
    const roleName = new Map((roles ?? []).map((r) => [r.id, r.name]));

    return (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      fullName: row.full_name,
      role: row.role_id ? (roleName.get(row.role_id) ?? null) : null,
      bio: row.bio,
      avatarUrl: row.avatar_url,
      linkedinUrl: row.linkedin_url,
      lattesUrl: row.lattes_url,
      websiteUrl: row.website_url,
    }));
  } catch {
    return [];
  }
}
