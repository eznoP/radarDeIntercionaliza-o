"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { cn } from "@/lib/utils";
import type { PostCardData } from "@/lib/post";

export function PostCarousel({ posts }: { posts: PostCardData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  const scrollByCards = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-card]");
    const amount = (firstCard?.offsetWidth ?? 280) + 16;
    el.scrollBy({ left: direction * amount * 2, behavior: "smooth" });
  };

  if (posts.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-dark-green/20 bg-sand/50 px-6 py-12 text-center font-body text-sm text-ink/55">
        Nenhuma publicação ainda.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Trilha */}
      <div
        ref={trackRef}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:-mx-8 sm:scroll-pl-8 sm:px-8"
        role="region"
        aria-label="Últimas postagens"
      >
        {posts.map((post) => (
          <div
            key={post.id}
            data-card
            className="w-[78%] shrink-0 snap-start sm:w-[330px]"
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Setas sobrepostas, junto aos cards (como no Figma) */}
      <button
        type="button"
        onClick={() => scrollByCards(-1)}
        aria-label="Anterior"
        disabled={atStart}
        className={cn(
          "absolute left-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-dark-green shadow-lg ring-1 ring-black/5 backdrop-blur transition-all duration-300 ease-out hover:scale-105 hover:bg-white active:scale-95 sm:left-2",
          atStart && "pointer-events-none -translate-x-3 opacity-0",
        )}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={() => scrollByCards(1)}
        aria-label="Próximo"
        disabled={atEnd}
        className={cn(
          "absolute right-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-dark-green shadow-lg ring-1 ring-black/5 backdrop-blur transition-all duration-300 ease-out hover:scale-105 hover:bg-white active:scale-95 sm:right-2",
          atEnd && "pointer-events-none translate-x-3 opacity-0",
        )}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
