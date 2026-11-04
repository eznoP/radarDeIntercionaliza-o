import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site-config";

const columns = [
  {
    title: "Acompanhe",
    links: [
      ...(site.newsletterUrl
        ? [{ label: "Newsletter", href: "/#newsletter" }]
        : []),
      { label: "Podcast", href: "/podcast" },
    ],
  },
  {
    title: "Saiba mais",
    links: [
      { label: "Sobre o projeto", href: "/sobre-o-projeto" },
      { label: "Integrantes", href: "/integrantes" },
      { label: "Radar de tendências", href: "/radar-de-tendencias" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-dark-green text-white">
      {/* Marca-d'água: astrolábio */}
      <Image
        aria-hidden
        alt=""
        src="/brand/astrolabe.webp"
        width={389}
        height={367}
        className="pointer-events-none absolute -right-10 -top-6 w-[420px] opacity-[0.07] select-none"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8">
        {/* Divisória com o logo centralizado */}
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-white/25" />
          <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-vanilla">
            <Image
              src="/brand/logo-radar.png"
              alt=""
              width={56}
              height={56}
              className="h-11 w-11"
            />
          </span>
          <span className="h-px flex-1 bg-white/25" />
        </div>

        <div className="mx-auto mt-10 grid max-w-lg gap-10 text-center sm:grid-cols-2 sm:text-left">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-lg font-semibold text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/70 transition hover:text-vanilla"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {site.name}. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
