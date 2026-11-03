"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <button
        type="button"
        aria-label="Voltar ao topo"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="group flex items-center overflow-hidden rounded-full bg-dark-green text-white shadow-xl shadow-black/20 ring-1 ring-white/10 transition-all duration-300 ease-out hover:bg-moss active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-green"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center">
          <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </span>
        <span className="max-w-0 overflow-hidden whitespace-nowrap font-display text-sm font-semibold transition-[max-width,padding] duration-300 ease-out group-hover:max-w-[9rem] group-hover:pr-5">
          Voltar ao topo
        </span>
      </button>
    </div>
  );
}
