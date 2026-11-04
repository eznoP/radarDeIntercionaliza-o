"use client";

import { createClient } from "@/lib/supabase/client";

const MESSAGES: Record<string, string> = {
  "new row violates row-level security policy":
    "Sem permissão para enviar arquivos. Faça login novamente.",
  "The resource already exists":
    "Este arquivo já existe. Tente novamente.",
  "Payload too large": "Arquivo grande demais (limite de 50 MB).",
};

/**
 * Envia um arquivo para um bucket público do Storage e devolve a URL pública.
 */
export async function uploadToBucket(
  bucket: "media" | "avatars",
  file: File,
  folder = "",
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder ? `${folder}/` : ""}${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(MESSAGES[error.message] ?? `Falha no envio: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
