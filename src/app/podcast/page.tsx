import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackToTop } from "@/components/back-to-top";
import { PodcastDeck } from "@/components/podcast-deck";
import { PodcastLibrary } from "@/components/podcast-library";
import { getEpisodios } from "@/lib/podcast-feed";

export const metadata: Metadata = {
  title: "Podcast",
  description:
    "Entrevistas estruturadas com profissionais do comércio exterior, relações internacionais e economia.",
};

/** Rebusca o feed RSS a cada 30 min. */
export const revalidate = 1800;

export default async function Page() {
  const episodios = await getEpisodios();

  return (
    <>
      <SiteHeader />

      <main className="bg-cream">
        {/* Hero */}
        <section className="relative overflow-hidden bg-dark-green text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_20%,rgba(122,148,69,0.3),transparent_70%)]"
          />
          <Image
            aria-hidden
            alt=""
            src="/brand/globos-fala.webp"
            width={608}
            height={608}
            className="pointer-events-none absolute -right-20 -top-16 hidden w-[380px] opacity-[0.08] select-none sm:block"
          />
          <div className="relative mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">
              Podcast
            </h1>
          </div>
        </section>

        {/* Texto oficial */}
        <div className="mx-auto w-full max-w-[720px] px-5 pt-12 sm:px-8 sm:pt-16">
          <div className="space-y-5 font-body text-lg leading-relaxed text-ink/75">
            <p>
              Nesta seção, o podcast Radar Global apresenta entrevistas
              estruturadas com profissionais de diversas áreas ligadas ao
              comércio exterior, relações internacionais e economia. O objetivo
              do recurso audiovisual é divulgar, de forma acessível, discussões
              assertivas e enriquecedoras sobre temas relevantes para os
              contextos acadêmico e profissional. Por meio de uma linguagem
              simples, porém formal, os episódios trazem análises profundas e
              dinâmicas.
            </p>
            <p>
              Temáticas como o comércio exterior maranhense, câmbio e gestão de
              risco para exportadores, política comercial brasileira, diplomacia
              econômica, além da bioeconomia e produtos da sociobiodiversidade
              amazônica, são alguns dos tópicos debatidos no programa.
            </p>
          </div>
        </div>

        {/* Deck de episódios */}
        <section className="mx-auto w-full max-w-5xl px-5 pb-4 pt-10 sm:px-8">
          <h2 className="text-center font-display text-2xl font-bold text-dark-green">
            Episódios
          </h2>
          <p className="mt-1 text-center font-body text-sm text-ink/50">
            {episodios.length ? "Ouça direto por aqui." : "Aguardando o primeiro episódio."}
          </p>
          <div className="mt-6">
            <PodcastDeck episodios={episodios} />
          </div>
        </section>

        {/* Biblioteca minimizada, com botão para expandir */}
        <PodcastLibrary episodios={episodios} />
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  );
}
