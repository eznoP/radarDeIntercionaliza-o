import "server-only";

import { mockPosts } from "@/lib/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { PostCardData } from "@/lib/post";

/** Reexporta o tipo para quem consome as publicações pelo servidor. */
export type { PostCardData };

/** Conteúdo de exemplo, usado enquanto o Supabase não está configurado. */
function fromMock(): PostCardData[] {
  return mockPosts.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    image: p.image,
    isFeatured: Boolean(p.isFeatured),
    publishedAt: new Date(Date.now() - p.minutesAgo * 60000).toISOString(),
  }));
}

/**
 * Publicações publicadas para a Home. Destaques vêm primeiro.
 * Cai no conteúdo de exemplo se o Supabase não estiver configurado.
 */
export async function getPublishedPosts(limit = 12): Promise<PostCardData[]> {
  if (!isSupabaseConfigured()) return fromMock();

  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from("posts")
      .select(
        "id, title, cover_image_url, is_featured, published_at, category_id",
      )
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) return fromMock();

    const { data: categories } = await supabase
      .from("categories")
      .select("id, name");
    const nameOf = new Map((categories ?? []).map((c) => [c.id, c.name]));

    return (rows ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      category: nameOf.get(row.category_id) ?? "Geral",
      image: row.cover_image_url,
      isFeatured: row.is_featured,
      publishedAt: row.published_at,
    }));
  } catch {
    return fromMock();
  }
}
