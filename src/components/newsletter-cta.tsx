"use client";

import Image from "next/image";
import { site } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const GLOBOS = [
  { src: "/brand/news-globe-1.webp", w: 148, h: 130, pos: "-left-12 -top-8", delay: "0ms", dir: "-translate-x-2 -translate-y-1" },
  { src: "/brand/news-globe-2.webp", w: 154, h: 153, pos: "-right-14 -top-10", delay: "60ms", dir: "translate-x-2 -translate-y-2" },
  { src: "/brand/news-globe-3.webp", w: 154, h: 154, pos: "-right-12 -bottom-8", delay: "120ms", dir: "translate-x-2 translate-y-1" },
  { src: "/brand/news-globe-4.webp", w: 154, h: 153, pos: "-left-14 -bottom-10", delay: "180ms", dir: "-translate-x-2 translate-y-2" },
  { src: "/brand/news-globe-5.webp", w: 146, h: 146, pos: "-top-9 left-1/2 -translate-x-1/2", delay: "90ms", dir: "-translate-y-2" },
  { src: "/brand/news-globe-6.webp", w: 162, h: 147, pos: "-bottom-9 left-1/2 -translate-x-1/2", delay: "150ms", dir: "translate-y-2" },
];

/**
 * Botão de assinatura da Newsletter (Substack).
 * No hover (desktop): o botão cresce levemente e os globos da marca
 * irradiam de trás dele, uma "explosão" suave com saídas em sequência.
 */
export function NewsletterCta({ className }: { className?: string }) {
  return (
    <a
      href={site.newsletterUrl ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Assinar a Newsletter do Radar (abre em nova aba)"
      className={cn(
        "group relative inline-flex items-center justify-center",
        className,
      )}
    >
      {/* Globos irradiando de trás do botão (efeito explosão no hover) */}
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
      <span
        aria-hidden
        className="inline-flex scale-100 items-center rounded-full bg-dark-green px-8 py-4 font-display text-sm font-semibold text-vanilla shadow-md transition-transform duration-300 ease-out motion-safe:group-hover:scale-105 group-hover:bg-moss group-active:scale-95 md:text-base"
      >
        Assinar a Newsletter
      </span>
    </a>
  );
}
