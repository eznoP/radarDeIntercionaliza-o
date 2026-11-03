"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks, site, toolLinks } from "@/lib/site-config";

export function SiteHeader() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Esconde a navbar ao rolar para baixo e a mostra ao rolar para cima.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(y > last && y > 140);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o dropdown ao clicar fora.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Fecha o menu mobile ao voltar para o desktop.
  useEffect(() => {
    const onResize = () => window.innerWidth >= 768 && setMobileOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const hideHeader = hidden && !mobileOpen && !toolsOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-dark-green text-white transition-[transform,box-shadow] duration-300 ease-out",
        hideHeader ? "-translate-y-full" : "translate-y-0",
        scrolled && !hideHeader ? "shadow-lg shadow-black/10" : "shadow-none",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
        {/* Marca */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-transform duration-200 active:scale-[0.97]"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-vanilla ring-1 ring-white/10 transition group-hover:scale-105 sm:h-14 sm:w-14">
            <Image
              src="/brand/logo-radar.png"
              alt="Logotipo Radar de Internacionalização"
              width={56}
              height={56}
              className="h-10 w-10 sm:h-12 sm:w-12"
              priority
            />
          </span>
          <span className="leading-none">
            <span className="block text-[11px] uppercase tracking-[0.22em] text-vanilla/80 sm:text-xs">
              Radar de
            </span>
            <span className="block font-display text-lg font-semibold italic text-vanilla sm:text-xl">
              Internacionalização
            </span>
          </span>
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {navLinks.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}

          <div
            ref={toolsRef}
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setToolsOpen((v) => !v)}
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 font-display text-[15px] font-medium text-white/90 transition duration-200 hover:bg-white/10 hover:text-white active:scale-[0.96]"
            >
              Ferramentas
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  toolsOpen && "rotate-180",
                )}
              />
            </button>

            <div
              className={cn(
                "absolute right-0 top-full w-72 pt-3 transition-all duration-200 ease-out",
                toolsOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0",
              )}
            >
              <ul className="origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-dark-green/95 p-1.5 shadow-2xl backdrop-blur">
                {toolLinks.map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className="block rounded-xl px-3.5 py-2.5 font-body text-sm text-white/85 transition duration-150 hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        {/* Botão do menu mobile */}
        <button
          type="button"
          className="rounded-xl p-2.5 text-white transition duration-200 hover:bg-white/10 active:scale-90 md:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* Navegação mobile (expandível) */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/0 bg-dark-green transition-all duration-300 ease-out md:hidden",
          mobileOpen
            ? "max-h-[36rem] border-white/10 opacity-100"
            : "max-h-0 opacity-0",
        )}
      >
        <nav
          className="px-5 pb-5 pt-2 sm:px-8"
          aria-label="Principal (mobile)"
          aria-hidden={!mobileOpen}
        >
          <ul className="flex flex-col">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-3 text-[15px] font-medium text-white/90 transition hover:bg-white/10 active:scale-[0.98]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-3 px-3 text-[11px] uppercase tracking-[0.22em] text-vanilla/70">
            Ferramentas
          </p>
          <ul className="mt-1 flex flex-col">
            {toolLinks.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm text-white/85 transition hover:bg-white/10 active:scale-[0.98]"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
          <span className="sr-only">{site.name}</span>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-2.5 font-display text-[15px] font-medium text-white/90 transition duration-200 hover:bg-white/10 hover:text-white active:scale-[0.96]"
    >
      {children}
    </Link>
  );
}
