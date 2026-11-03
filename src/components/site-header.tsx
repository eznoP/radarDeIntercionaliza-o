"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks, site, toolLinks } from "@/lib/site-config";

export function SiteHeader() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o menu mobile ao redimensionar para desktop.
  useEffect(() => {
    const onResize = () => window.innerWidth >= 768 && setMobileOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-dark-green text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Marca */}
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-vanilla sm:h-11 sm:w-11">
            <Image
              src="/brand/logo-radar.png"
              alt="Logotipo Radar de Internacionalização"
              width={44}
              height={44}
              className="h-8 w-8 sm:h-9 sm:w-9"
              priority
            />
          </span>
          <span className="leading-none">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-vanilla/80">
              Radar de
            </span>
            <span className="block font-display text-base font-semibold italic text-vanilla sm:text-lg">
              Internacionalização
            </span>
          </span>
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {navLinks.map((l) => (
            <NavA key={l.href} href={l.href}>
              {l.label}
            </NavA>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setToolsOpen((v) => !v)}
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              Ferramentas
              <ChevronDown
                className={cn("h-4 w-4 transition", toolsOpen && "rotate-180")}
              />
            </button>

            {toolsOpen && (
              <div className="absolute right-0 top-full w-64 pt-2">
                <ul className="overflow-hidden rounded-2xl border border-white/10 bg-dark-green/95 p-1.5 shadow-xl backdrop-blur">
                  {toolLinks.map((t) => (
                    <li key={t.href}>
                      <Link
                        href={t.href}
                        className="block rounded-xl px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
                      >
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* Botão do menu mobile */}
        <button
          type="button"
          className="rounded-lg p-2 text-white md:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Navegação mobile */}
      {mobileOpen && (
        <nav
          className="border-t border-white/10 bg-dark-green px-4 pb-4 md:hidden"
          aria-label="Principal (mobile)"
        >
          <ul className="flex flex-col py-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-2 px-3 text-[10px] uppercase tracking-[0.22em] text-vanilla/70">
            Ferramentas
          </p>
          <ul className="flex flex-col">
            {toolLinks.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-white/10"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
          <span className="sr-only">{site.name}</span>
        </nav>
      )}
    </header>
  );
}

function NavA({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  );
}
