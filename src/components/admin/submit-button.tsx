"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  pendingLabel = "Salvando…",
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();

  const variants = {
    primary:
      "bg-dark-green text-white hover:bg-moss hover:shadow-lg shadow-sm",
    ghost:
      "bg-white text-dark-green ring-1 ring-dark-green/15 hover:bg-dark-green/5",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  } as const;

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-display text-sm font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
