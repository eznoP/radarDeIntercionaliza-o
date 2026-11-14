"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { PostCardData } from "@/lib/post";
import { timeAgo } from "@/lib/post";

/**
 * Biblioteca de publicações da página, sempre expandida.
 * Formato fixo: grid de cards com capa, selo de destaque, tempo e autor.
 */
export function PostsLibrary({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) return null;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-dark-green">
            Publicações
          </h2>
          <p className="mt-1 font-body text-sm text-ink/50">
            {posts.length} {posts.length === 1 ? "publicação" : "publicações"}
            .
          </p>
        </div>
      </div>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  {p.publishedAt ? ` · ${timeAgo(p.publishedAt)}` : ""}
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
    </section>
  );
}
