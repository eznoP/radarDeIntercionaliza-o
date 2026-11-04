"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { dbErrorMessage } from "@/lib/admin/errors";
import { errorState, type FormState } from "@/lib/admin/types";
import { optionalText, requiredText } from "@/lib/admin/validation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

const LIST_PATH = "/admin/categorias";

function readForm(formData: FormData) {
  const errors: Record<string, string> = {};
  const name = requiredText(formData, "name", "nome", errors);
  const description = optionalText(formData, "description");
  const sort_order = Number(optionalText(formData, "sort_order")) || 0;
  return { errors, name, description, sort_order };
}

/** Verifica se já existe categoria com o mesmo nome ou slug. */
async function findDuplicate(name: string, slug: string, ignoreId?: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name, slug");
  const rows = data ?? [];
  const byName = rows.find(
    (r) =>
      r.id !== ignoreId && r.name.trim().toLowerCase() === name.toLowerCase(),
  );
  const bySlug = rows.find((r) => r.id !== ignoreId && r.slug === slug);
  return { byName, bySlug };
}

export async function createCategory(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { errors, name, description, sort_order } = readForm(formData);
  if (Object.keys(errors).length) {
    return errorState("Preencha os campos destacados.", errors);
  }

  const slug = slugify(name);
  if (!slug) {
    return errorState("O nome precisa conter letras ou números.", {
      name: "Informe um nome válido.",
    });
  }

  const { byName, bySlug } = await findDuplicate(name, slug);
  if (byName) {
    return errorState("Já existe uma categoria com este nome.", {
      name: "Já existe uma categoria com este nome.",
    });
  }
  if (bySlug) {
    return errorState("Já existe uma categoria com nome parecido (mesmo slug).", {
      name: "Escolha um nome um pouco diferente.",
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description: description || null,
    sort_order,
  });
  if (error) return errorState(dbErrorMessage(error));

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");
  redirect(`${LIST_PATH}?ok=${encodeURIComponent("Categoria criada com sucesso.")}`);
}

export async function updateCategory(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { errors, name, description, sort_order } = readForm(formData);
  if (Object.keys(errors).length) {
    return errorState("Preencha os campos destacados.", errors);
  }

  const slug = slugify(name);
  if (!slug) {
    return errorState("O nome precisa conter letras ou números.", {
      name: "Informe um nome válido.",
    });
  }

  const { byName, bySlug } = await findDuplicate(name, slug, id);
  if (byName || bySlug) {
    return errorState("Já existe outra categoria com este nome.", {
      name: "Já existe outra categoria com este nome.",
    });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, slug, description: description || null, sort_order })
    .eq("id", id);
  if (error) return errorState(dbErrorMessage(error));

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");
  redirect(
    `${LIST_PATH}?ok=${encodeURIComponent("Categoria atualizada com sucesso.")}`,
  );
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");

  if (error) {
    const message =
      error.code === "23503"
        ? "Não foi possível excluir: existem publicações usando esta categoria."
        : dbErrorMessage(error);
    redirect(`${LIST_PATH}?erro=${encodeURIComponent(message)}`);
  }
  redirect(`${LIST_PATH}?ok=${encodeURIComponent("Categoria excluída.")}`);
}
