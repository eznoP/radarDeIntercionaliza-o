"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Campo de senha com botão para mostrar/ocultar o valor. */
export function PasswordInput({
  id,
  name,
  placeholder,
  invalid = false,
  autoComplete = "current-password",
  className,
}: {
  id: string;
  name: string;
  placeholder?: string;
  invalid?: boolean;
  autoComplete?: string;
  className: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative block">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid}
        className={cn(className, "pr-11")}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Ver senha"}
        aria-pressed={visible}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink/40 transition hover:text-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/40 active:scale-90"
      >
        {visible ? (
          <EyeOff className="h-4.5 w-4.5" aria-hidden />
        ) : (
          <Eye className="h-4.5 w-4.5" aria-hidden />
        )}
      </button>
    </span>
  );
}
