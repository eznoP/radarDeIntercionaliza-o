import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site-config";

export const metadata = {
  title: "Em manutenção",
  description: "O Radar de Internacionalização está em manutenção.",
};

export default function ManutencaoPage() {
  return (
    <main className="relative -mt-16 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-dark-green px-6 text-center text-white sm:-mt-20">
      {/* Marca-d'água: rosa dos ventos */}
      <Image
        aria-hidden
        alt=""
        src="/brand/compass-rose.webp"
        width={608}
        height={608}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[420px] max-w-[80vw] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.08]"
      />

      <p className="relative font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-vanilla/75">
        {site.name}
      </p>
      <h1 className="relative mt-4 font-display text-4xl font-bold sm:text-5xl">
        Estamos em manutenção
      </h1>
      <p className="relative mt-3 max-w-md font-body text-base text-white/75">
        O Radar volta em instantes.
      </p>

      <Link
        href="/admin/login"
        className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-vanilla px-6 py-3 font-display text-sm font-semibold text-dark-green shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
      >
        Área da equipe
      </Link>
    </main>
  );
}
