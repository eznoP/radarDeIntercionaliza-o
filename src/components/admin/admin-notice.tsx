import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/** Aviso amigável quando o painel não pode ser carregado (ex.: sem acesso). */
export function AdminNotice({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        <span className="rounded-full bg-vanilla px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider text-dark-green">
          Painel do gestor
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-dark-green sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 font-body text-ink/70">{description}</p>
        <div className="mt-8">
          {action ?? (
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-dark-green px-6 py-3 font-display text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-moss hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              Voltar para a Home
            </Link>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
