import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <main className="-mt-16 flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center bg-cream px-6 text-center sm:-mt-20">
      <div className="relative h-28 w-28 sm:h-36 sm:w-36">
        <Image
          alt=""
          src="/brand/compass-rose.webp"
          fill
          sizes="144px"
          className="object-contain opacity-70 mix-blend-multiply"
        />
      </div>
      <p className="mt-2 font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-moss">
        Erro 404
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold text-dark-green sm:text-4xl">
        Página não encontrada
      </h1>
      <p className="mt-2 max-w-sm font-body text-sm text-ink/60">
        O endereço mudou ou nunca existiu.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-dark-green px-6 py-3 font-display text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-moss hover:shadow-lg active:translate-y-0 active:scale-95"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
