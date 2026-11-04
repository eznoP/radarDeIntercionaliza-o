import "server-only";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { PostCardData, PostDetail } from "@/lib/post";

/** Reexporta o tipo para quem consome as publicações pelo servidor. */
export type { PostCardData, PostDetail };

/**
 * Publicações publicadas para a Home. Destaques vêm primeiro.
 * Sem Supabase configurado, retorna uma lista vazia.
 */
export async function getPublishedPosts(limit = 12): Promise<PostCardData[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from("posts")
      .select(
        "id, slug, title, cover_image_url, is_featured, published_at, category_id",
      )
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) return [];

    const { data: categories } = await supabase
      .from("categories")
      .select("id, name");
    const nameOf = new Map((categories ?? []).map((c) => [c.id, c.name]));

    return (rows ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: nameOf.get(row.category_id) ?? "Geral",
      image: row.cover_image_url,
      isFeatured: row.is_featured,
      publishedAt: row.published_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Publicação completa pelo slug, para a página de leitura.
 * Retorna null se não existir (ou não estiver visível para o visitante).
 */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !row) return null;

    const [{ data: category }, { data: author }] = await Promise.all([
      supabase
        .from("categories")
        .select("name")
        .eq("id", row.category_id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("full_name, role_id")
        .eq("id", row.author_id)
        .maybeSingle(),
    ]);

    let roleName: string | null = null;
    if (author?.role_id) {
      const { data: role } = await supabase
        .from("roles")
        .select("name")
        .eq("id", author.role_id)
        .maybeSingle();
      roleName = role?.name ?? null;
    }

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      coverImage: row.cover_image_url,
      videoUrl: row.video_url,
      category: category?.name ?? "Geral",
      authorName: author?.full_name ?? "Equipe Radar",
      authorRole: roleName,
      publishedAt: row.published_at,
      isFeatured: row.is_featured,
    };
  } catch {
    return null;
  }
}
