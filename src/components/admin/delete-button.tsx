"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

function Inner({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-display text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50",
        className,
      )}
    >
      {pending ? "Excluindo…" : children}
    </button>
  );
}

/** Formulário de exclusão com confirmação. `action` deve ser uma Server Action já vinculada ao id. */
export function DeleteButton({
  action,
  confirmText = "Tem certeza que deseja excluir? Esta ação não pode ser desfeita.",
  children = "Excluir",
  className,
}: {
  action: () => Promise<void>;
  confirmText?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="inline"
    >
      <Inner className={className}>{children}</Inner>
    </form>
  );
}
