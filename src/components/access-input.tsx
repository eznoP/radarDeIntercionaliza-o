"use client";

import { useState } from "react";
import { INTEGRANTE_EMAIL_DOMAIN } from "@/lib/access";
import { cn } from "@/lib/utils";

const SUFFIX = `@${INTEGRANTE_EMAIL_DOMAIN}`;

/** Tira o sufixo automático (tolerando maiúsculas) que veio colado. */
const STRIP_SUFFIX = new RegExp(`@${INTEGRANTE_EMAIL_DOMAIN}\\s*$`, "i");

/**
 * Campo de acesso estilo Gmail: a pessoa digita "joao.silva" e o sufixo
 * "@integrantes.radar" aparece em cinza dentro do próprio campo. O valor
 * enviado ao servidor é só o prefixo — quem anexa o domínio é o backend.
 */
export function AccessInput({
  id,
  name,
  defaultValue = "",
  placeholder = "joao.silva",
  invalid = false,
  className,
  onBlur,
}: {
  id: string;
  name: string;
  /** Suporta um acesso salvo já com o domínio ou em formato de e-mail. */
  defaultValue?: string;
  placeholder?: string;
  invalid?: boolean;
  /** Classes do <input>. O espelho as reutiliza para alinhar o sufixo. */
  className: string;
  onBlur?: (value: string) => void;
}) {
  const [value, setValue] = useState(() =>
    defaultValue.replace(STRIP_SUFFIX, ""),
  );

  // Acesso antigo pode ser um e-mail literal (gestor) — nesse caso não há sufixo.
  const showSuffix = value.length > 0 && !value.includes("@");

  return (
    <span className="relative block">
      <input
        id={id}
        name={name}
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        placeholder={placeholder}
        aria-invalid={invalid}
        value={value}
        onChange={(e) =>
          setValue(
            e.target.value
              .replace(STRIP_SUFFIX, "")
              .replace(/[@\s]/g, ""),
          )
        }
        onBlur={(e) => onBlur?.(e.target.value)}
        className={className}
      />
      {showSuffix && (
        <span
          aria-hidden
          className={cn(
            className,
            // O espelho repete as classes do input para alinhar fonte/padding,
            // mas precisa anular o próprio fundo e borda para não tapar o texto.
            "pointer-events-none absolute inset-0 flex items-center whitespace-nowrap overflow-hidden",
            "bg-transparent border-transparent shadow-none ring-0 text-ink/40",
          )}
        >
          <span className="text-transparent">{value}</span>
          {SUFFIX}
        </span>
      )}
    </span>
  );
}
