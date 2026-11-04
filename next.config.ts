import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Imagens enviadas ao Supabase Storage são servidas por *.supabase.co.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
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
