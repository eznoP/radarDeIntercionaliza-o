"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

/** Liga ou desliga a página de manutenção do site público. */
export async function setMaintenance(mode: "on" | "off"): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_config")
    .update({ value: mode })
    .eq("key", "maintenance_mode");

  if (error) {
    console.error("[manutencao] falha ao atualizar:", error.message);
    throw new Error("Tente de novo em instantes.");
  }

  revalidatePath("/admin");
}
