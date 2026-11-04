"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isMenu, navItems, site, type NavMenu } from "@/lib/site-config";
import { BrandIcon } from "@/components/brand-icons";

export function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

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

  // Fecha os dropdowns ao clicar fora da navegação ou com Esc.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Fecha o menu mobile ao voltar para o desktop.
  useEffect(() => {
    const onResize = () => window.innerWidth >= 768 && setMobileOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const hideHeader = hidden && !mobileOpen && !openMenu;

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
        <nav
          ref={navRef}
          className="hidden items-center gap-1 md:flex"
          aria-label="Principal"
        >
          {navItems.map((entry) =>
            isMenu(entry) ? (
              <DesktopMenu
                key={entry.label}
                menu={entry}
                open={openMenu === entry.label}
                onOpen={() => setOpenMenu(entry.label)}
                onClose={() =>
                  setOpenMenu((v) => (v === entry.label ? null : v))
                }
              />
            ) : (
              <NavLink key={entry.href} href={entry.href}>
                {entry.label}
              </NavLink>
            ),
          )}
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
            ? "max-h-[46rem] border-white/10 opacity-100"
            : "max-h-0 opacity-0",
        )}
      >
        <nav
          className="px-5 pb-5 pt-2 sm:px-8"
          aria-label="Principal (mobile)"
          aria-hidden={!mobileOpen}
        >
          {navItems.map((entry) =>
            isMenu(entry) ? (
              <div key={entry.label} className="mt-3 first:mt-0">
                <p className="px-3 text-[11px] uppercase tracking-[0.22em] text-vanilla/70">
                  {entry.label}
                </p>
                <ul className="mt-1 flex flex-col">
                  {entry.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/85 transition hover:bg-white/10 active:scale-[0.98]"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-vanilla">
                          <BrandIcon name={item.icon} className="h-4 w-4" />
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul key={entry.href} className="flex flex-col first:mt-0 mt-3">
                <li>
                  <Link
                    href={entry.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-3 py-3 text-[15px] font-medium text-white/90 transition hover:bg-white/10 active:scale-[0.98]"
                  >
                    {entry.label}
                  </Link>
                </li>
              </ul>
            ),
          )}
          <span className="sr-only">{site.name}</span>
        </nav>
      </div>
    </header>
  );
}

function DesktopMenu({
  menu,
  open,
  onOpen,
  onClose,
}: {
  menu: NavMenu;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const alignRight = menu.align === "right";
  const hoverRef = useRef(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Fecha com um pequeno atraso para o ponteiro poder ir do botão ao painel.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      hoverRef.current = false;
      onClose();
    }, 150);
  };

  const handleEnter = () => {
    cancelClose();
    if (!open) hoverRef.current = true;
    onOpen();
  };

  // O primeiro clique após abrir por hover apenas "fixa" o menu aberto;
  // o seguinte alterna para fechado. Sem hover, alterna normalmente.
  const handleClick = () => {
    if (!open) {
      hoverRef.current = false;
      onOpen();
      return;
    }
    if (hoverRef.current) {
      hoverRef.current = false;
      return;
    }
    onClose();
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-4 py-2.5 font-display text-[15px] font-medium transition duration-200 active:scale-[0.96]",
          open
            ? "bg-white/10 text-white"
            : "text-white/90 hover:bg-white/10 hover:text-white",
        )}
      >
        {menu.label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "absolute top-full z-10 w-72 pt-3 transition-all duration-200 ease-out",
          alignRight ? "right-0" : "left-0",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0",
        )}
      >
        <ul
          className={cn(
            "overflow-hidden rounded-2xl border border-white/10 bg-dark-green/95 p-1.5 shadow-2xl backdrop-blur",
            alignRight ? "origin-top-right" : "origin-top-left",
          )}
        >
          {menu.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm text-white/85 transition duration-150 hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
              >
                {item.icon && (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-vanilla">
                    <BrandIcon name={item.icon} className="h-4 w-4" />
                  </span>
                )}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
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
