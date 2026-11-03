import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cabeçalhos COOP/COEP necessários para o ffmpeg.wasm (conversão de vídeo -> .webm
  // no navegador) rodar com SharedArrayBuffer. Aplicados apenas na rota de upload.
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
