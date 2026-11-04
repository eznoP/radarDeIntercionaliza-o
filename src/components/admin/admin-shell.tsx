"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Tags,
  Users,
  X,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/publicacoes", label: "Publicações", icon: Newspaper },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/cargos", label: "Cargos", icon: Briefcase },
  { href: "/admin/integrantes", label: "Integrantes", icon: Users },
];

export function AdminShell({
  profile,
  children,
}: {
  profile: { name: string; email: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="-mt-16 flex min-h-dvh bg-cream sm:-mt-20">
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-dark-green text-white transition-transform duration-300 ease-out md:sticky md:top-0 md:h-dvh md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-4 sm:h-20">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-vanilla">
              <Image
                src="/brand/logo-radar.png"
                alt=""
                width={56}
                height={56}
                className="h-8 w-8"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-vanilla/75">
                Radar de
              </span>
              <span className="block font-display text-sm font-semibold italic text-vanilla">
                Painel do gestor
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-display text-sm font-medium transition duration-150",
                  active
                    ? "bg-vanilla text-dark-green"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 px-1.5">
            <p className="truncate font-display text-sm font-medium text-white">
              {profile.name}
            </p>
            {profile.email && (
              <p className="truncate text-xs text-white/55">{profile.email}</p>
            )}
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            Ver site
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-dark-green/10 bg-cream/90 px-4 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-dark-green hover:bg-dark-green/5"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-display text-sm font-semibold text-dark-green">
            Painel do gestor
          </span>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
