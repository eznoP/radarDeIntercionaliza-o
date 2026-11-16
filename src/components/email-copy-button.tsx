"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/** Ângulos dos raios em volta do botão (graus). */
const ANGULOS = [0, 60, 120, 180, 240, 300];

/**
 * Botão que copia o email do integrante para a área de transferência.
 * Feedback: o botão fica verde, dá um salto com raios pequenos saindo
 * dele e um selo "Email copiado!" aparece por alguns instantes.
 */
export function EmailCopyButton({ email }: { email: string }) {
  const [copiado, setCopiado] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copiar() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const t = document.createElement("textarea");
        t.value = email;
        t.style.position = "fixed";
        t.style.opacity = "0";
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        t.remove();
      }
      setCopiado(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiado(false), 1800);
    } catch {
      // sem permissão de cópia: nada acontece
    }
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={copiar}
        aria-label={`Copiar o email ${email}`}
        title="Copiar email"
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-full ring-1 transition-colors duration-300",
          copiado
            ? "email-salto bg-emerald-500 text-white ring-emerald-500"
            : "bg-cream text-dark-green ring-dark-green/10 hover:bg-moss hover:text-white",
        )}
      >
        <Mail className="h-4 w-4" />

        {/* Raios que voam do botão ao copiar */}
        {copiado &&
          ANGULOS.map((a) => (
            <span
              key={a}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ transform: `rotate(${a}deg)` }}
            >
              <span className="email-raio grid h-full w-full place-items-center">
                <Zap className="h-3 w-3 fill-current text-emerald-500" />
              </span>
            </span>
          ))}
      </button>

      {/* Selo de confirmação */}
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-dark-green px-2.5 py-1 font-display text-[11px] font-semibold text-white opacity-0 shadow-sm transition-all duration-300",
          copiado ? "translate-y-0 opacity-100" : "translate-y-1",
        )}
      >
        Email copiado!
      </span>
    </span>
  );
}
