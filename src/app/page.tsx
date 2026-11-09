import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostCarousel } from "@/components/post-carousel";
import { BackToTop } from "@/components/back-to-top";
import { GlobeGrid } from "@/components/brand-icons";
import { getPublishedPosts } from "@/lib/posts";
import { site } from "@/lib/site-config";

export const revalidate = 300;

export default async function HomePage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <SiteHeader />

      <main>
        {/* ===================== Título ===================== */}
        <section className="relative overflow-hidden bg-dark-green text-white">
          {/* Brilho suave da marca */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_75%_35%,rgba(122,148,69,0.28),transparent_70%)]"
          />
          {/* Marca-d'água: rosa dos ventos */}
          <Image
            aria-hidden
            alt=""
            src="/brand/compass-rose.webp"
            width={608}
            height={608}
            className="pointer-events-none absolute -right-20 top-1/2 hidden w-[520px] -translate-y-1/2 opacity-[0.12] select-none sm:block"
          />

          <div className="relative mx-auto w-full max-w-[1400px] px-5 pt-12 pb-10 text-center sm:px-8 sm:pt-16">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-vanilla/75">
              {site.name}
            </p>
            {/* Título provisório — aguardando o nome oficial do projeto. */}
            <h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Nome do Projeto
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-body text-sm text-white/75 sm:text-base">
              {site.tagline}
            </p>
          </div>
        </section>

        {/* ===================== Últimas postagens ===================== */}
        <section className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-dark-green/15 pb-3">
            <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-dark-green sm:text-3xl">
              <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-dark-green text-vanilla sm:grid">
                <GlobeGrid className="h-5 w-5" />
              </span>
              Confira nossas últimas postagens
            </h2>
            <Link
              href="/radar-de-tendencias"
              className="hidden shrink-0 font-display text-sm font-medium text-glaucous transition duration-200 hover:text-dark-green active:scale-95 sm:block"
            >
              Ver todas
            </Link>
          </div>

          <PostCarousel posts={posts} />
        </section>

        {/* ===================== Newsletter (link externo) ===================== */}
        {site.newsletterUrl && (
          <section
            id="newsletter"
            className="relative scroll-mt-24 overflow-hidden bg-moss/15"
          >
            <Image
              aria-hidden
              alt=""
              src="/brand/compass-rose.webp"
              width={608}
              height={608}
              className="pointer-events-none absolute -left-20 top-1/2 w-[340px] -translate-y-1/2 opacity-[0.07] brightness-0 select-none"
            />
            <div className="relative mx-auto w-full max-w-[1400px] px-5 py-16 text-center sm:px-8">
              <h2 className="font-display text-2xl font-semibold text-dark-green sm:text-3xl">
                Receba a nossa newsletter
              </h2>
              <p className="mx-auto mt-3 max-w-xl font-body text-sm text-ink/75 sm:text-base">
                Novidades de comércio exterior e internacionalização direto no
                seu e-mail.
              </p>
              <a
                href={site.newsletterUrl}
                className="mt-7 inline-flex items-center rounded-full bg-dark-green px-7 py-3.5 font-display text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-moss hover:shadow-lg active:translate-y-0 active:scale-95"
              >
                Assinar newsletter
              </a>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  );
}
