"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { dbErrorMessage } from "@/lib/admin/errors";
import { errorState, type FormState } from "@/lib/admin/types";
import { optionalText, requiredText } from "@/lib/admin/validation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

const LIST_PATH = "/admin/cargos";

function readForm(formData: FormData) {
  const errors: Record<string, string> = {};
  const name = requiredText(formData, "name", "nome", errors);
  const description = optionalText(formData, "description");
  const sort_order = Number(optionalText(formData, "sort_order")) || 0;
  return { errors, name, description, sort_order };
}

async function findDuplicate(name: string, slug: string, ignoreId?: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("roles").select("id, name, slug");
  const rows = data ?? [];
  const byName = rows.find(
    (r) =>
      r.id !== ignoreId && r.name.trim().toLowerCase() === name.toLowerCase(),
  );
  const bySlug = rows.find((r) => r.id !== ignoreId && r.slug === slug);
  return { byName, bySlug };
}

export async function createRole(
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
    return errorState("Já existe um cargo com este nome.", {
      name: "Já existe um cargo com este nome.",
    });
  }
  if (bySlug) {
    return errorState("Já existe um cargo com nome parecido (mesmo slug).", {
      name: "Escolha um nome um pouco diferente.",
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("roles").insert({
    name,
    slug,
    description: description || null,
    sort_order,
  });
  if (error) return errorState(dbErrorMessage(error));

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");
  redirect(`${LIST_PATH}?ok=${encodeURIComponent("Cargo criado com sucesso.")}`);
}

export async function updateRole(
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
    return errorState("Já existe outro cargo com este nome.", {
      name: "Já existe outro cargo com este nome.",
    });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("roles")
    .update({ name, slug, description: description || null, sort_order })
    .eq("id", id);
  if (error) return errorState(dbErrorMessage(error));

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");
  redirect(
    `${LIST_PATH}?ok=${encodeURIComponent("Cargo atualizado com sucesso.")}`,
  );
}

export async function deleteRole(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("roles").delete().eq("id", id);

  revalidatePath(LIST_PATH);
  revalidatePath("/admin");

  if (error) {
    redirect(
      `${LIST_PATH}?erro=${encodeURIComponent("Não foi possível excluir este cargo.")}`,
    );
  }
  redirect(`${LIST_PATH}?ok=${encodeURIComponent("Cargo excluído.")}`);
}
