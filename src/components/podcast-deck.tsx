"use client";

import { useState } from "react";
import type { Episodio } from "@/lib/podcast-feed";
import { cn } from "@/lib/utils";

/** Número de cards visíveis atrás do da frente (efeito de profundidade). */
const PROFUNDIDADE = 3;

/**
 * Baralho de episódios: card da frente em foco, os anteriores empilhados
 * atrás com deslocamento e escala (profundidade, sem rotação).
 */
export function PodcastDeck({ episodios }: { episodios: Episodio[] }) {
  const [frente, setFrente] = useState(0);

  if (episodios.length === 0) {
    return (
      <p className="rounded-card border border-dark-green/10 bg-white px-6 py-10 text-center font-body text-ink/60">
        Episódios em breve.
      </p>
    );
  }

  const total = episodios.length;
  // Navegação limitada: o mais recente é o card inicial (índice 0) e o mais
  // antigo é o último — sem "dar a volta". Cada extremo desativa um botão.
  const avancar = () => setFrente((f) => Math.min(f + 1, total - 1));
  const voltar = () => setFrente((f) => Math.max(f - 1, 0));
  const noMaisRecente = frente === 0;
  const noMaisAntigo = frente === total - 1;

  // Da frente para trás: frente, frente+1, frente+2 …
  // A chave é o próprio episódio: assim, ao trocar, cada card MANTÉM o nó no
  // DOM e a transição CSS anima o deslize de um slot para o outro.
  const ordem = Array.from(
    { length: Math.min(PROFUNDIDADE + 1, total) },
    (_, i) => ({ ep: episodios[(frente + i) % total], slot: i }),
  );

  return (
    <div>
      {/* Palco dos cards empilhados */}
      <div className="relative mx-auto h-[340px] w-full max-w-xl sm:h-[330px]">
        {ordem.map(({ ep, slot: i }) => (
          <article
            key={ep.titulo}
            aria-hidden={i > 0}
            className={cn(
              "absolute inset-x-0 top-0 mx-auto w-full max-w-lg rounded-card border border-dark-green/10 bg-white p-6 shadow-md transition-all duration-300 ease-out sm:p-7",
              i === 0
                ? "z-30 translate-y-0 scale-100 shadow-lg"
                : i === 1
                  ? "z-20 -translate-y-4 scale-[0.96] opacity-80"
                  : i === 2
                    ? "z-10 -translate-y-7 scale-[0.92] opacity-60"
                    : "z-0 -translate-y-9 scale-[0.88] opacity-40",
            )}
            style={{ pointerEvents: i === 0 ? "auto" : "none" }}
          >
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-moss">
              {ep.data}
              {ep.duracao ? ` · ${ep.duracao}` : ""}
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-dark-green sm:text-2xl">
              {ep.titulo}
            </h3>
            {ep.descricao && (
              <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-ink/70">
                {ep.descricao}
              </p>
            )}
            {/* Player: interno ou via proxy para áudio externo */}
            <audio
              controls
              preload="none"
              src={
                ep.audioUrl.startsWith("/")
                  ? ep.audioUrl
                  : `/api/podcast/audio?url=${encodeURIComponent(ep.audioUrl)}`
              }
              className="mt-5 w-full"
            >
              Seu navegador não suporta o player.
            </audio>
          </article>
        ))}
      </div>

      {/* Navegação */}
      <div className="mt-2 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={voltar}
          disabled={noMaisRecente}
          aria-label="Episódio anterior"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-dark-green shadow-sm ring-1 ring-dark-green/15 transition enabled:hover:bg-cream enabled:active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="font-display text-xs font-semibold uppercase tracking-wider text-ink/40">
          {frente + 1} / {total}
        </span>
        <button
          type="button"
          onClick={avancar}
          disabled={noMaisAntigo}
          aria-label="Próximo episódio"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-dark-green shadow-sm ring-1 ring-dark-green/15 transition enabled:hover:bg-cream enabled:active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
