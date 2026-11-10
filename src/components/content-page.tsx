import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackToTop } from "@/components/back-to-top";

/**
 * Página de conteúdo textual do site: hero escuro com a marca + corpo
 * em fundo cream, com os parágrafos passados como children.
 */
export function ContentPage({
  title,
  watermark,
  children,
}: {
  title: string;
  /** Imagem decorativa da marca (caminho em /brand). */
  watermark: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />

      <main className="bg-cream">
        <section className="relative overflow-hidden bg-dark-green text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_20%,rgba(122,148,69,0.3),transparent_70%)]"
          />
          <Image
            aria-hidden
            alt=""
            src={watermark}
            width={608}
            height={608}
            className="pointer-events-none absolute -right-20 -top-16 hidden w-[380px] opacity-[0.08] select-none sm:block"
          />
          <div className="relative mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">
              {title}
            </h1>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[720px] px-5 py-12 sm:px-8 sm:py-16">
          <div className="space-y-5 font-body text-[1.02rem] leading-relaxed text-ink/75">
            {children}
          </div>
        </div>
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  );
}
