import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, isSupabaseConfigured } from "@/lib/supabase/server";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Solicitar acesso",
  robots: { index: false, follow: false },
};

export default async function CadastroPage() {
  // Quem já está logado (ou pendente) não precisa se cadastrar.
  const current = await getCurrentProfile();
  if (current) redirect("/meu-perfil");

  const configured = isSupabaseConfigured();
  const onVercel = Boolean(process.env.VERCEL);

  return (
    <main className="relative -mt-16 flex min-h-dvh items-center justify-center overflow-hidden bg-powder px-5 py-12 sm:-mt-20">
      {/* Brilho quente e a rosa dos ventos: a "vinda" para o projeto */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[34rem] w-[34rem] rounded-full bg-vanilla/40 blur-3xl"
      />
      <Image
        aria-hidden
        alt=""
        src="/brand/compass-rose.webp"
        width={608}
        height={608}
        className="pointer-events-none absolute -left-32 top-1/2 w-[480px] -translate-y-1/2 opacity-[0.12] select-none sm:block"
        style={{ filter: "brightness(0)" }}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-card bg-white shadow-2xl ring-1 ring-dark-green/10">
        {/* Faixa de boas-vindas — o que diferencia desta tela para o login */}
        <div className="bg-vanilla px-7 py-6 text-center sm:px-8">
          <span className="mx-auto grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-white/90 shadow-sm">
            <Image
              src="/brand/logo-radar.png"
              alt="Radar de Internacionalização"
              width={48}
              height={48}
              className="h-10 w-10"
              priority
            />
          </span>
          <h1 className="mt-3 font-display text-xl font-semibold text-dark-green">
            Solicitar acesso
          </h1>
        </div>

        <div className="p-7 sm:p-8">
          {configured ? (
            <>
              <SignupForm />
              <p className="mt-6 text-center font-body text-xs text-ink/50">
                Já tem conta?{" "}
                <Link
                  href="/admin/login"
                  className="font-medium text-glaucous underline-offset-2 hover:underline"
                >
                  Entrar
                </Link>
              </p>
            </>
          ) : (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
              <strong className="font-semibold">Supabase não configurado.</strong>{" "}
              {onVercel ? (
                <>
                  Defina{" "}
                  <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
                  <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
                  nas variáveis de ambiente do projeto e faça um novo deploy.
                </>
              ) : (
                <>
                  Preencha o <code className="font-mono">.env.local</code> com a
                  URL e as chaves do projeto e reinicie o servidor.
                </>
              )}
            </div>
          )}

          <p className="mt-6 text-center font-body text-xs text-ink/50">
            <Link href="/" className="underline-offset-2 hover:underline">
              Voltar para o site
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
