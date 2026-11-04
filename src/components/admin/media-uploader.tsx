"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { convertImageToWebp, convertVideoToWebm } from "@/lib/media/convert";
import { uploadToBucket } from "@/lib/supabase/media";
import { cn } from "@/lib/utils";

/**
 * Campo de upload de mídia: converte (imagem -> .webp, vídeo -> .webm),
 * envia ao Storage e guarda a URL pública num input oculto.
 */
export function MediaUploader({
  name,
  bucket,
  kind,
  folder,
  defaultValue,
  label,
  hint,
  required,
}: {
  name: string;
  bucket: "media" | "avatars";
  kind: "image" | "video";
  folder?: string;
  defaultValue?: string | null;
  label: string;
  hint?: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = kind === "image" ? "image/*" : "video/*";

  const handleFile = async (file: File) => {
    setError(null);
    setBusy(true);
    setProgress(0);
    try {
      const converted =
        kind === "image"
          ? await convertImageToWebp(file)
          : await convertVideoToWebm(file, (r) => setProgress(r));
      const publicUrl = await uploadToBucket(bucket, converted, folder);
      setUrl(publicUrl);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Falha ao processar o arquivo. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="font-display text-sm font-medium text-dark-green">
        {label}
        {required && <span className="ml-0.5 text-moss">*</span>}
      </label>

      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative overflow-hidden rounded-xl border border-dark-green/15 bg-white">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Pré-visualização"
              className="max-h-56 w-full object-cover"
            />
          ) : (
            <video src={url} controls className="max-h-56 w-full bg-black" />
          )}
          <button
            type="button"
            onClick={() => {
              setUrl("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            aria-label="Remover arquivo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition",
            busy
              ? "cursor-progress border-moss/40 bg-moss/5"
              : "border-dark-green/20 bg-white hover:border-moss hover:bg-moss/5",
          )}
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-moss" />
              <span className="font-body text-xs text-ink/60">
                {kind === "video"
                  ? `Convertendo… ${Math.round(progress * 100)}%`
                  : "Enviando…"}
              </span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-moss" />
              <span className="font-display text-sm font-medium text-dark-green">
                Escolher {kind === "image" ? "imagem" : "vídeo"}
              </span>
              <span className="font-body text-xs text-ink/50">
                {kind === "image"
                  ? "Será convertida para .webp"
                  : "Será convertido para .webm"}
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {hint && !error && <p className="text-xs text-ink/50">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
