"use client";

/** Converte uma imagem para .webp (redimensionando o lado maior). */
export async function convertImageToWebp(
  file: File,
  { maxSide = 2000, quality = 0.82 }: { maxSide?: number; quality?: number } = {},
): Promise<File> {
  if (file.type === "image/webp") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não suporta a conversão de imagem.");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) throw new Error("Não foi possível converter a imagem para .webp.");

  const base = file.name.replace(/\.[^.]+$/, "") || "imagem";
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}

/**
 * Converte um vídeo para .webm usando ffmpeg.wasm (roda no navegador).
 * Requer isolamento de origem (COOP/COEP) — já configurado em /admin.
 * Se o arquivo já for .webm, é devolvido sem alterações.
 */
export async function convertVideoToWebm(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<File> {
  if (file.type === "video/webm" || file.name.toLowerCase().endsWith(".webm")) {
    return file;
  }

  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

  const ffmpeg = new FFmpeg();
  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => {
      onProgress(Math.min(0.99, Math.max(0, progress)));
    });
  }
  onProgress?.(0);

  // Core carregado via CDN (evita configurar o bundler).
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  const ext = file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? ".mp4";
  const inputName = `input${ext}`;
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    inputName,
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "1200k",
    "-crf",
    "34",
    "-c:a",
    "libopus",
    "-b:a",
    "96k",
    "output.webm",
  ]);

  const data = await ffmpeg.readFile("output.webm");
  const bytes: Uint8Array =
    typeof data === "string" ? new TextEncoder().encode(data) : data;
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([buffer], { type: "video/webm" });

  onProgress?.(1);

  const base = file.name.replace(/\.[^.]+$/, "") || "video";
  return new File([blob], `${base}.webm`, { type: "video/webm" });
}
