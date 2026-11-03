"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/lib/mock-data";

export function PostCarousel({ posts }: { posts: Post[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-card]");
    const amount = (firstCard?.offsetWidth ?? 280) + 16;
    el.scrollBy({ left: direction * amount * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Controles */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <CarouselButton label="Anterior" onClick={() => scrollByCards(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </CarouselButton>
        <CarouselButton label="Próximo" onClick={() => scrollByCards(1)}>
          <ChevronRight className="h-5 w-5" />
        </CarouselButton>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0"
        role="region"
        aria-label="Últimas postagens"
      >
        {posts.map((post) => (
          <div
            key={post.id}
            data-card
            className="w-[78%] shrink-0 snap-start sm:w-[320px]"
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-dark-green/20 bg-white text-dark-green transition hover:bg-dark-green hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
    >
      {children}
    </button>
  );
}
