import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FileText, Globe, Linkedin, LogIn, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackToTop } from "@/components/back-to-top";
import { getApprovedIntegrantes } from "@/lib/integrantes";

export const metadata: Metadata = {
  title: "Integrantes",
  description:
    "Conheça as pessoas que constroem o Radar de Internacionalização.",
};

export default async function IntegrantesPage() {
  const integrantes = await getApprovedIntegrantes();

  return (
    <>
      <SiteHeader />

      <main className="bg-cream">
        {/* Cabeçalho */}
        <section className="relative overflow-hidden bg-dark-green text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_20%,rgba(122,148,69,0.3),transparent_70%)]"
          />
          <Image
            aria-hidden
            alt=""
            src="/brand/compass-rose.webp"
            width={608}
            height={608}
            className="pointer-events-none absolute -right-20 -top-16 hidden w-[380px] opacity-[0.08] select-none sm:block"
          />
          <div className="relative mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-vanilla">
              <UserRound className="h-3.5 w-3.5" />
              Quem faz o Radar
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Integrantes
            </h1>
            <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-white/75">
              Conheça as pessoas por trás das notícias, pesquisas e projetos do
              Radar de Internacionalização.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          {integrantes.length === 0 ? (
            <div className="rounded-card border border-dark-green/10 bg-white px-6 py-14 text-center shadow-sm">
              <h2 className="font-display text-xl font-semibold text-dark-green">
                Em breve
              </h2>
              <p className="mx-auto mt-2 max-w-md font-body text-sm text-ink/60">
                Os perfis da equipe estão sendo preparados. Volte em breve para
                conhecer quem constrói o Radar.
              </p>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {integrantes.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col items-center rounded-card border border-dark-green/10 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-sand ring-2 ring-moss/25">
                    {p.avatarUrl ? (
                      <Image
                        src={p.avatarUrl}
                        alt={p.fullName}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <UserRound className="h-10 w-10 text-ink/30" />
                    )}
                  </span>

                  <h2 className="mt-4 font-display text-lg font-semibold text-dark-green">
                    {p.fullName}
                  </h2>
                  {p.role && (
                    <span className="mt-1 rounded-full bg-moss/15 px-3 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wide text-dark-green">
                      {p.role}
                    </span>
                  )}
                  {p.bio && (
                    <p className="mt-3 font-body text-sm leading-relaxed text-ink/65">
                      {p.bio}
                    </p>
                  )}

                  {(p.linkedinUrl || p.lattesUrl || p.websiteUrl) && (
                    <div className="mt-4 flex items-center gap-2 pt-2">
                      {p.linkedinUrl && (
                        <SocialLink href={p.linkedinUrl} label="LinkedIn">
                          <Linkedin className="h-4 w-4" />
                        </SocialLink>
                      )}
                      {p.lattesUrl && (
                        <SocialLink href={p.lattesUrl} label="Currículo Lattes">
                          <FileText className="h-4 w-4" />
                        </SocialLink>
                      )}
                      {p.websiteUrl && (
                        <SocialLink href={p.websiteUrl} label="Site ou contato">
                          <Globe className="h-4 w-4" />
                        </SocialLink>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Chamada para quem é do grupo */}
          <div className="mt-12 flex flex-col items-center gap-3 rounded-card bg-dark-green px-6 py-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Você é integrante do Radar?
              </h2>
              <p className="mt-1 font-body text-sm text-white/70">
                Entre com o seu acesso para personalizar o seu perfil.
              </p>
            </div>
            <Link
              href="/admin/login"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-vanilla px-6 py-3 font-display text-sm font-semibold text-dark-green shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              Sou integrante: entrar
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full bg-cream text-dark-green ring-1 ring-dark-green/10 transition hover:bg-moss hover:text-white"
    >
      {children}
    </a>
  );
}
