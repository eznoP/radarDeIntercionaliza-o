import type { Metadata } from "next";
import Image from "next/image";
import { ContentPage } from "@/components/content-page";
import { NewsletterCta } from "@/components/newsletter-cta";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Receba conteúdos do Radar de Internacionalização direto no seu e-mail.",
};

export default function Page() {
  return (
    <ContentPage
      title="Newsletter"
      watermark="/brand/containers.webp"
    >
      <p>
        A Newsletter Radar reúne, em um e-mail periódico, os conteúdos do
        projeto: notícias, indicadores, casos de internacionalização e os
        episódios do podcast. Uma forma direta de acompanhar o que o Radar
        publica.
      </p>
      <div className="flex justify-center py-7">
        <NewsletterCta />
      </div>
      <p className="text-center font-body text-xs text-ink/45">
        Abre em uma nova aba.
      </p>
      <div className="relative mt-6 overflow-hidden rounded-card border border-dark-green/10 bg-white p-6 shadow-sm">
        <Image
          aria-hidden
          alt=""
          src="/brand/compass-rose.webp"
          width={160}
          height={160}
          className="pointer-events-none absolute -right-6 -top-8 w-32 opacity-[0.08] mix-blend-multiply"
        />
        <h2 className="relative font-display text-lg font-semibold text-dark-green">
          O que você recebe
        </h2>
        <ul className="relative mt-3 space-y-2 font-body text-sm text-ink/70">
          <li>· Notícias curtas do Radar de tendências</li>
          <li>· Novos episódios do Radar Global</li>
          <li>· Casos de internacionalização e indicadores do Maranhão</li>
        </ul>
      </div>
    </ContentPage>
  );
}
