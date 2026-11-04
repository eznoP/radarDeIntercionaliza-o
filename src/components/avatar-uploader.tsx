"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, RotateCcw, Upload, X, ZoomIn } from "lucide-react";
import { uploadToBucket } from "@/lib/supabase/media";
import { cn } from "@/lib/utils";

const BOX = 256; // lado da área de recorte, em px
const OUT = 512; // lado da imagem exportada, em px

type Offset = { x: number; y: number };

/**
 * Seletor de foto de perfil no estilo WhatsApp: escolhe da galeria, ajusta o
 * enquadramento (arrastar + zoom) e exporta um .webp circular com transparência.
 */
export function AvatarUploader({
  name,
  userId,
  defaultValue,
  label = "Foto de perfil",
}: {
  name: string;
  userId: string;
  defaultValue?: string | null;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );

  const baseScale = img
    ? Math.max(BOX / img.naturalWidth, BOX / img.naturalHeight)
    : 1;
  const scale = baseScale * zoom;
  const drawW = img ? img.naturalWidth * scale : 0;
  const drawH = img ? img.naturalHeight * scale : 0;

  const clampOffset = useCallback(
    (o: Offset, w: number, h: number): Offset => {
      const maxX = Math.max(0, (w - BOX) / 2);
      const maxY = Math.max(0, (h - BOX) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, o.x)),
        y: Math.min(maxY, Math.max(-maxY, o.y)),
      };
    },
    [],
  );

  // Ao mudar o zoom, reajusta o enquadramento para não sair do círculo.
  useEffect(() => {
    setOffset((o) => clampOffset(o, drawW, drawH));
  }, [drawW, drawH, clampOffset]);

  const pickFile = (file: File) => {
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    image.onerror = () => setError("Não foi possível abrir esta imagem.");
    image.src = objectUrl;
  };

  const cancelCrop = () => {
    setImg(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    if (inputRef.current) inputRef.current.value = "";
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!img) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !img) return;
    setOffset(
      clampOffset(
        { x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) },
        drawW,
        drawH,
      ),
    );
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const save = async () => {
    if (!img) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Seu navegador não suporta o recorte de imagem.");

      const k = OUT / BOX;
      ctx.save();
      ctx.beginPath();
      ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        img,
        (BOX / 2 + offset.x) * k - (drawW * k) / 2,
        (BOX / 2 + offset.y) * k - (drawH * k) / 2,
        drawW * k,
        drawH * k,
      );
      ctx.restore();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.9),
      );
      if (!blob) throw new Error("Não foi possível gerar a imagem.");

      const file = new File([blob], "avatar.webp", { type: "image/webp" });
      const publicUrl = await uploadToBucket("avatars", file, userId);
      setUrl(publicUrl);
      cancelCrop();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Falha ao enviar a foto. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className="font-display text-sm font-medium text-dark-green">
        {label}
      </span>

      <input type="hidden" name={name} value={url} />

      {img ? (
        <div className="space-y-3">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative touch-none select-none overflow-hidden rounded-2xl bg-dark-green/90"
            style={{ width: BOX, height: BOX }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt="Pré-visualização"
              draggable={false}
              className="absolute left-0 top-0 max-w-none"
              style={{
                width: drawW,
                height: drawH,
                transform: `translate(${(BOX - drawW) / 2 + offset.x}px, ${
                  (BOX - drawH) / 2 + offset.y
                }px)`,
              }}
            />
            {/* Máscara circular: escurece o que fica fora do recorte */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ring-2 ring-white/80"
              style={{ width: BOX, height: BOX }}
            />
          </div>

          <label className="flex items-center gap-2 font-body text-xs text-ink/60">
            <ZoomIn className="h-4 w-4 text-moss" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-full max-w-[180px] accent-moss"
              aria-label="Zoom"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-4 py-2 font-display text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {busy ? "Enviando…" : "Salvar foto"}
            </button>
            <button
              type="button"
              onClick={cancelCrop}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 font-display text-sm font-medium text-ink/60 transition hover:bg-dark-green/5"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-sand ring-1 ring-dark-green/10">
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Upload className="h-6 w-6 text-ink/40" />
            )}
          </span>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-4 py-2 font-display text-sm font-semibold text-white transition hover:bg-moss"
            >
              <Upload className="h-4 w-4" />
              {url ? "Trocar foto" : "Escolher foto"}
            </button>
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="block font-body text-xs text-ink/50 underline-offset-2 hover:underline"
              >
                Remover foto
              </button>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) pickFile(file);
        }}
      />

      <p className={cn("font-body text-xs", error ? "text-red-600" : "text-ink/50")}>
        {error ??
          "Escolha uma foto da galeria, ajuste o enquadramento e salve. Vira um .webp redondo."}
      </p>

      {img && (
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
          className="inline-flex items-center gap-1.5 font-body text-xs text-ink/50 hover:text-dark-green"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reajustar
        </button>
      )}
    </div>
  );
}
