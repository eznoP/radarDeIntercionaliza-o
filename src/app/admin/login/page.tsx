import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="relative -mt-16 flex min-h-dvh items-center justify-center overflow-hidden bg-dark-green px-5 py-12 sm:-mt-20">
      <Image
        aria-hidden
        alt=""
        src="/brand/compass-rose.webp"
        width={608}
        height={608}
        className="pointer-events-none absolute -right-24 top-1/2 hidden w-[520px] -translate-y-1/2 opacity-[0.1] select-none sm:block"
      />

      <div className="relative w-full max-w-sm rounded-card bg-cream p-7 shadow-2xl ring-1 ring-black/5 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-vanilla">
            <Image
              src="/brand/logo-radar.png"
              alt="Radar de Internacionalização"
              width={56}
              height={56}
              className="h-12 w-12"
              priority
            />
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold text-dark-green">
            Painel do gestor
          </h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            Entre com sua conta para gerenciar o conteúdo.
          </p>
        </div>

        {configured ? (
          <LoginForm redirectTo={redirectTo} />
        ) : (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            <strong className="font-semibold">Supabase não configurado.</strong>{" "}
            Preencha o <code className="font-mono">.env.local</code> com a URL e
            as chaves do projeto e reinicie o servidor.
          </div>
        )}

        <p className="mt-6 text-center font-body text-xs text-ink/50">
          <Link href="/" className="underline-offset-2 hover:underline">
            Voltar para o site
          </Link>
        </p>
      </div>
    </main>
  );
}
