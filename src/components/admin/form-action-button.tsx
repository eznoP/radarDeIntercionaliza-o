"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

function Inner({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-display text-xs font-semibold transition disabled:opacity-50",
        className,
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/**
 * Botão que dispara uma Server Action já vinculada (ex.: aprovar um perfil),
 * com confirmação opcional e rótulo de progresso.
 */
export function FormActionButton({
  action,
  children,
  pendingLabel = "Enviando…",
  confirmText,
  className,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  pendingLabel?: string;
  confirmText?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
      className="inline"
    >
      <Inner pendingLabel={pendingLabel} className={className}>
        {children}
      </Inner>
    </form>
  );
}
