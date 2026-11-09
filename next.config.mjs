

/**
 * CSP moderada: sem embeds externos no site (fontes são locais), então
 * tudo vem de 'self' + Supabase (imagens/mídia/REST). Em dev, 'unsafe-eval'
 * é necessário para o Next.js; em produção fica de fora.
 */
const cspParts = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${
    process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"
  }`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "media-src 'self' blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
];
const csp = cspParts.join("; ");

const nextConfig = {
  // Não vaza "X-Powered-By: Next.js".
  poweredByHeader: false,
  images: {
    // Formatos modernos primeiro (com fallback automático).
    formats: ["image/avif", "image/webp"],
    // Imagens enviadas ao Supabase Storage são servidas por *.supabase.co.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    // Cabeçalhos de proteção em todas as rotas.
    const globalHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      { key: "Content-Security-Policy", value: csp },
    ];
    if (process.env.NODE_ENV === "production") {
      globalHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [
      {
        source: "/:path*",
        headers: globalHeaders,
      },
      {
        // Cabeçalhos COOP/COEP necessários para o ffmpeg.wasm (conversão de vídeo -> .webm
        // no navegador) rodar com SharedArrayBuffer. Aplicados apenas na rota de upload.
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
