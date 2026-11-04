"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePanelMember } from "@/lib/admin/auth";
import { dbErrorMessage } from "@/lib/admin/errors";
import { errorState, type FormState } from "@/lib/admin/types";
import { checkbox, optionalText, requiredText } from "@/lib/admin/validation";
import { createClient } from "@/lib/supabase/server";
import type { Json, PostStatus } from "@/lib/database.types";
import { slugify } from "@/lib/slugify";

const LIST_PATH = "/admin/publicacoes";

type AnyNode = { text?: string; content?: AnyNode[] };

function extractText(node: AnyNode | null | undefined): string {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.content)) return node.content.map(extractText).join(" ");
  return "";
}

function readContent(
  formData: FormData,
  errors: Record<string, string>,
): Json | null {
  const raw = String(formData.get("content") ?? "");
  if (!raw) {
    errors.content = "Insira o/a conteúdo";
    return null;
  }
  let doc: unknown;
  try {
    doc = JSON.parse(raw);
  } catch {
    errors.content = "Insira o/a conteúdo";
    return null;
  }
  if (!extractText(doc as AnyNode).trim()) {
    errors.content = "Insira o/a conteúdo";
    return null;
  }
  return doc as Json;
}

function readForm(formData: FormData) {
  const errors: Record<string, string> = {};

  const title = requiredText(formData, "title", "título", errors);
  const excerpt = requiredText(formData, "excerpt", "resumo", errors);
  const category_id = requiredText(formData, "category_id", "categoria", errors);
  const author_id = requiredText(formData, "author_id", "autor(a)", errors);
  const content = readContent(formData, errors);

  const slugInput = optionalText(formData, "slug");
  const slug = slugify(slugInput || title);
  if (!slug) errors.slug = "Insira o/a endereço";

  const cover_image_url = optionalText(formData, "cover_image_url");
  const video_url = optionalText(formData, "video_url");
  const is_featured = checkbox(formData, "is_featured");

  const statusRaw = optionalText(formData, "status");
  const status: PostStatus =
    statusRaw === "published"
      ? "published"
      : statusRaw === "archived"
        ? "archived"
        : "draft";

  const publishedAtRaw = optionalText(formData, "published_at");

  return {
    errors,
    title,
    excerpt,
    slug,
    category_id,
    author_id,
    content,
    cover_image_url,
    video_url,
    is_featured,
    status,
    publishedAtRaw,
  };
}

function resolvePublishedAt(raw: string, status: PostStatus): string | null {
  if (raw) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  if (status === "published") return new Date().toISOString();
  return null;
}

async function slugTaken(slug: string, ignoreId?: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("id, slug");
  return (data ?? []).some((p) => p.id !== ignoreId && p.slug === slug);
}

function revalidateAll() {
  revalidatePath(LIST_PATH);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/radar-de-tendencias");
}

export async function createPost(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await requirePanelMember();
  const profile = me.profile;
  if (!profile) return errorState("Perfil não encontrado.");
  const isAdmin = profile.is_admin;

  const f = readForm(formData);
  if (Object.keys(f.errors).length) {
    return errorState("Preencha os campos destacados.", f.errors);
  }
  if (await slugTaken(f.slug)) {
    return errorState("Já existe uma publicação com este endereço (slug).", {
      slug: "Escolha outro endereço.",
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("posts").insert({
    title: f.title,
    slug: f.slug,
    excerpt: f.excerpt,
    content: f.content,
    cover_image_url: f.cover_image_url || null,
    video_url: f.video_url || null,
    category_id: f.category_id,
    // Integrante comum só publica em nome próprio; destaque é do gestor.
    author_id: isAdmin ? f.author_id : profile.id,
    is_featured: isAdmin ? f.is_featured : false,
    status: f.status,
    published_at: resolvePublishedAt(f.publishedAtRaw, f.status),
  });
  if (error) return errorState(dbErrorMessage(error));

  revalidateAll();
  redirect(
    `${LIST_PATH}?ok=${encodeURIComponent("Publicação criada com sucesso.")}`,
  );
}

export async function updatePost(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await requirePanelMember();
  const profile = me.profile;
  if (!profile) return errorState("Perfil não encontrado.");
  const isAdmin = profile.is_admin;

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("posts")
    .select("author_id, is_featured")
    .eq("id", id)
    .maybeSingle();
  if (!current) return errorState("Publicação não encontrada.");
  if (!isAdmin && current.author_id !== profile.id) {
    return errorState("Você só pode editar as publicações criadas por você.");
  }

  const f = readForm(formData);
  if (Object.keys(f.errors).length) {
    return errorState("Preencha os campos destacados.", f.errors);
  }
  if (await slugTaken(f.slug, id)) {
    return errorState("Já existe uma publicação com este endereço (slug).", {
      slug: "Escolha outro endereço.",
    });
  }

  const { error } = await supabase
    .from("posts")
    .update({
      title: f.title,
      slug: f.slug,
      excerpt: f.excerpt,
      content: f.content,
      cover_image_url: f.cover_image_url || null,
      video_url: f.video_url || null,
      category_id: f.category_id,
      // Integrante comum mantém a própria autoria e o destaque do gestor.
      author_id: isAdmin ? f.author_id : profile.id,
      is_featured: isAdmin ? f.is_featured : current.is_featured,
      status: f.status,
      published_at: resolvePublishedAt(f.publishedAtRaw, f.status),
    })
    .eq("id", id);
  if (error) return errorState(dbErrorMessage(error));

  revalidateAll();
  redirect(
    `${LIST_PATH}?ok=${encodeURIComponent("Publicação atualizada com sucesso.")}`,
  );
}

export async function deletePost(id: string): Promise<void> {
  const me = await requirePanelMember();
  const profile = me.profile;
  const supabase = await createClient();

  if (!profile?.is_admin) {
    const { data: current } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", id)
      .maybeSingle();
    if (!current || current.author_id !== profile?.id) {
      redirect(
        `${LIST_PATH}?erro=${encodeURIComponent("Você só pode excluir as publicações criadas por você.")}`,
      );
    }
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  revalidateAll();

  if (error) {
    redirect(`${LIST_PATH}?erro=${encodeURIComponent(dbErrorMessage(error))}`);
  }
  redirect(`${LIST_PATH}?ok=${encodeURIComponent("Publicação excluída.")}`);
}
