import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostCarousel } from "@/components/post-carousel";
import { BackToTop } from "@/components/back-to-top";
import { mockPosts } from "@/lib/mock-data";
import { site } from "@/lib/site-config";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ===================== Hero ===================== */}
        <section className="bg-dark-green text-white">
          <div className="mx-auto max-w-6xl px-4 pt-14 pb-8 text-center sm:px-6 sm:pt-20">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-vanilla/75">
              {site.name}
            </p>
            {/* Título provisório — aguardando o nome oficial do projeto. */}
            <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Nome do Projeto
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-body text-sm text-white/75 sm:text-base">
              {site.tagline}
            </p>
          </div>

          {/* Imagem de destaque — placeholder até a foto oficial da equipe. */}
          <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card ring-1 ring-white/10 sm:aspect-[16/7]">
              <Image
                src="/brand/containers2.webp"
                alt="Porto com contêineres representando o comércio internacional"
                fill
                priority
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-green/70 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 rounded-full bg-dark-green/80 px-3 py-1 font-body text-xs font-medium text-white backdrop-blur">
                Imagem de destaque
              </span>
            </div>
          </div>
        </section>

        {/* ===================== Últimas postagens ===================== */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-dark-green/15 pb-3">
            <h2 className="font-display text-2xl font-semibold text-dark-green sm:text-3xl">
              Confira nossas últimas postagens
            </h2>
            <Link
              href="/radar-de-tendencias"
              className="hidden shrink-0 text-sm font-medium text-glaucous transition hover:text-dark-green sm:block"
            >
              Ver todas
            </Link>
          </div>

          <PostCarousel posts={mockPosts} />
        </section>

        {/* ===================== Newsletter (link externo) ===================== */}
        <section id="newsletter" className="bg-moss/15 scroll-mt-20">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
            <h2 className="font-display text-2xl font-semibold text-dark-green sm:text-3xl">
              Receba a nossa newsletter
            </h2>
            <p className="mt-3 font-body text-sm text-ink/75 sm:text-base">
              Novidades de comércio exterior e internacionalização direto no seu
              e-mail.
            </p>
            <a
              href={site.newsletterUrl}
              className="mt-6 inline-flex items-center rounded-full bg-dark-green px-6 py-3 font-display text-sm font-semibold text-white transition hover:bg-moss"
            >
              Assinar newsletter
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  );
}
