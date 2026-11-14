"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import type { PostCardData } from "@/lib/post";
import { timeAgo } from "@/lib/post";
import { cn } from "@/lib/utils";

/**
 * Biblioteca de publicações de uma página, minimizada por padrão:
 * o botão expande a lista com transição suave de altura (0fr→1fr).
 */
export function PostsLibrary({ posts }: { posts: PostCardData[] }) {
  const [aberta, setAberta] = useState(false);

  if (posts.length === 0) return null;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-dark-green">
            Publicações
          </h2>
          <p className="mt-1 font-body text-sm text-ink/50">
            {posts.length} {posts.length === 1 ? "publicação" : "publicações"}
            .
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAberta((a) => !a)}
          aria-expanded={aberta}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-sm font-semibold text-dark-green shadow-sm ring-1 ring-dark-green/15 transition duration-200 hover:-translate-y-0.5 hover:bg-cream active:translate-y-0 active:scale-95"
        >
          {aberta ? "Ocultar publicações" : "Exibir publicações"}
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
          <ul className="grid gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/noticia/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-dark-green/10 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Capa */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream">
                    {p.image ? (
                      <Image
                        alt=""
                        src={p.image}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <Image
                          aria-hidden
                          alt=""
                          src="/brand/compass-rose.webp"
                          width={120}
                          height={120}
                          className="opacity-25 mix-blend-multiply"
                        />
                      </div>
                    )}
                    {p.isFeatured && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-vanilla px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-dark-green shadow-sm">
                        <Star className="h-3 w-3" />
                        Destaque
                      </span>
                    )}
                  </div>

                  {/* Corpo */}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-moss">
                      {p.category}
                      {p.publishedAt
                        ? ` · ${timeAgo(p.publishedAt)}`
                        : ""}
                    </p>
                    <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-dark-green transition group-hover:text-moss">
                      {p.title}
                    </h3>
                    <p className="mt-auto pt-3 font-body text-xs text-ink/50">
                      {p.author ?? "Equipe Radar"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
