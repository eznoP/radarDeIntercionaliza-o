"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { site } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Globos da explosão (desktop, no hover). */
const GLOBOS = [
  { src: "/brand/news-globe-1.webp", w: 148, h: 130, pos: "-left-12 -top-8", delay: "0ms", dir: "-translate-x-2 -translate-y-1" },
  { src: "/brand/news-globe-2.webp", w: 154, h: 153, pos: "-right-14 -top-10", delay: "60ms", dir: "translate-x-2 -translate-y-2" },
  { src: "/brand/news-globe-3.webp", w: 154, h: 154, pos: "-right-12 -bottom-8", delay: "120ms", dir: "translate-x-2 translate-y-1" },
  { src: "/brand/news-globe-4.webp", w: 154, h: 153, pos: "-left-14 -bottom-10", delay: "180ms", dir: "-translate-x-2 translate-y-2" },
  { src: "/brand/news-globe-5.webp", w: 146, h: 146, pos: "-top-9 left-1/2 -translate-x-1/2", delay: "90ms", dir: "-translate-y-2" },
  { src: "/brand/news-globe-6.webp", w: 162, h: 147, pos: "-bottom-9 left-1/2 -translate-x-1/2", delay: "150ms", dir: "translate-y-2" },
];

/**
 * Globos em órbita contínua (toque: celular/tablet).
 * Cada globo circula no próprio ponto ao redor do botão, com
 * ondulação elástica; posições em px a partir do centro do botão.
 */
const ORBITA = [
  { src: "/brand/news-globe-1.webp", w: 148, h: 130, x: -118, y: -22, r: 8, dur: 8, fase: 0, ondu: 2.7 },
  { src: "/brand/news-globe-2.webp", w: 154, h: 153, x: 124, y: -26, r: -8, dur: 10, fase: 1.3, ondu: 3.3 },
  { src: "/brand/news-globe-3.webp", w: 154, h: 154, x: 120, y: 24, r: 8, dur: 9, fase: 2.1, ondu: 2.9 },
  { src: "/brand/news-globe-4.webp", w: 154, h: 153, x: -122, y: 26, r: -8, dur: 11, fase: 0.7, ondu: 3.6 },
  { src: "/brand/news-globe-5.webp", w: 146, h: 146, x: 2, y: -46, r: 8, dur: 8.5, fase: 1.8, ondu: 3.1 },
  { src: "/brand/news-globe-6.webp", w: 162, h: 147, x: -2, y: 38, r: -8, dur: 9.5, fase: 2.9, ondu: 2.6 },
];

const vars = (o: Record<string, string>) => o as CSSProperties;

/**
 * Botão de assinatura da Newsletter (Substack).
 * Desktop (hover): o botão cresce e os globos irradiam de trás dele.
 * Toque (celular/tablet): os globos entram em órbita contínua e fluida
 * assim que o botão aparece na tela, com leve distorção ao girar.
 */
export function NewsletterCta({ className }: { className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [noToque, setNoToque] = useState(false);
  const [emTela, setEmTela] = useState(false);

  useEffect(() => {
    const fina = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setNoToque(!fina);
  }, []);

  // Inicia a órbita quando o botão entra na tela (e mantém constante).
  useEffect(() => {
    const alvo = ref.current;
    if (!noToque || !alvo) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setEmTela(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(alvo);
    return () => obs.disconnect();
  }, [noToque]);

  return (
    <a
      ref={ref}
      href={site.newsletterUrl ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Assinar a Newsletter do Radar (abre em nova aba)"
      className={cn(
        "group relative inline-flex items-center justify-center",
        className,
      )}
    >
      {/* Desktop: globos irradiando de trás do botão (explosão no hover) */}
      {GLOBOS.map((g, i) => (
        <Image
          key={g.src}
          aria-hidden
          alt=""
          src={g.src}
          width={g.w}
          height={g.h}
          className={cn(
            "pointer-events-none absolute h-9 w-auto select-none",
            "opacity-0 scale-75",
            "transition-[opacity,transform] duration-500 ease-out",
            "group-hover:scale-100 group-hover:opacity-80",
            g.pos,
            i % 2 === 0 ? "rotate-[-8deg]" : "rotate-[8deg]",
            g.dir,
          )}
          style={{ transitionDelay: `${g.delay}` }}
        />
      ))}

      {/* Toque: órbita contínua assim que o botão aparece na tela */}
      {noToque && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out",
            emTela ? "opacity-100" : "opacity-0",
          )}
        >
          {ORBITA.map((g) => (
            <span
              key={g.src}
              className="absolute h-0 w-0"
              style={{
                left: `calc(50% + ${g.x}px)`,
                top: `calc(50% + ${g.y}px)`,
              }}
            >
              {/* giro do ponto ao redor da própria posição */}
              <span
                className="globo-orbita absolute block h-0 w-0"
                style={vars({ "--dur": `${g.dur}s`, "--delay": `-${g.fase}s` })}
              >
                {/* pequeno raio (o sinal define o sentido do círculo) */}
                <span
                  className="absolute block"
                  style={{ transform: `translateY(${g.r}px)` }}
                >
                  {/* contragiro mantém o globo de cabeça para cima */}
                  <span
                    className="globo-contragiro absolute block h-0 w-0"
                    style={vars({
                      "--dur": `${g.dur}s`,
                      "--delay": `-${g.fase}s`,
                    })}
                  >
                    <span className="absolute block -translate-x-1/2 -translate-y-1/2">
                      <Image
                        aria-hidden
                        alt=""
                        src={g.src}
                        width={g.w}
                        height={g.h}
                        className="globo-ondulante h-7 w-auto max-w-none select-none opacity-80"
                        style={vars({ "--ondu": `${g.ondu}s` })}
                      />
                    </span>
                  </span>
                </span>
              </span>
            </span>
          ))}
        </span>
      )}

      <span
        aria-hidden
        className="inline-flex scale-100 items-center rounded-full bg-dark-green px-8 py-4 font-display text-sm font-semibold text-vanilla shadow-md transition-transform duration-300 ease-out motion-safe:group-hover:scale-105 group-hover:bg-moss group-active:scale-95 md:text-base"
      >
        Assinar a Newsletter
      </span>
    </a>
  );
}
