"use client";

import { useState } from "react";
import type { Episodio } from "@/lib/podcast-feed";
import { cn } from "@/lib/utils";

/**
 * Biblioteca de episódios, minimizada por padrão: o botão expande a
 * lista com uma transição suave de altura (grid-template-rows 0fr→1fr).
 */
export function PodcastLibrary({ episodios }: { episodios: Episodio[] }) {
  const [aberta, setAberta] = useState(false);

  if (episodios.length <= 1) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-dark-green">
            Biblioteca
          </h2>
          <p className="mt-1 font-body text-sm text-ink/50">
            {episodios.length} episódios publicados.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAberta((a) => !a)}
          aria-expanded={aberta}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-sm font-semibold text-dark-green shadow-sm ring-1 ring-dark-green/15 transition duration-200 hover:-translate-y-0.5 hover:bg-cream active:translate-y-0 active:scale-95"
        >
          {aberta ? "Ocultar episódios" : "Exibir todos os episódios"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className={cn(
              "transition-transform duration-300",
              aberta && "rotate-180",
            )}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Recolhimento suave: a linha do grid cresce de 0fr para 1fr */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-out",
          aberta ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          className={cn(
            "min-h-0 overflow-hidden transition-opacity duration-500",
            aberta ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <ul className="grid gap-4 pt-5 sm:grid-cols-2">
            {episodios.map((ep, i) => (
              <li
                key={`${ep.titulo}-${i}`}
                className="rounded-card border border-dark-green/10 bg-white p-5 shadow-sm"
              >
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-moss">
                  {ep.data}
                  {ep.duracao ? ` · ${ep.duracao}` : ""}
                </p>
                <h3 className="mt-1.5 font-display text-base font-bold text-dark-green">
                  {ep.titulo}
                </h3>
                {ep.descricao && (
                  <p className="mt-2 line-clamp-2 font-body text-sm text-ink/60">
                    {ep.descricao}
                  </p>
                )}
                <audio
                  controls
                  preload="none"
                  src={
                    ep.audioUrl.startsWith("/")
                      ? ep.audioUrl
                      : `/api/podcast/audio?url=${encodeURIComponent(ep.audioUrl)}`
                  }
                  className="mt-3 w-full"
                >
                  Seu navegador não suporta o player.
                </audio>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
