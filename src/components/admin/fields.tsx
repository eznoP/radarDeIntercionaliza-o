import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="font-display text-sm font-medium text-dark-green"
      >
        {label}
        {required && <span className="ml-0.5 text-moss">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink/50">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function fieldInputClass(invalid?: boolean) {
  return cn(
    "w-full rounded-xl border bg-white px-3.5 py-2.5 font-body text-sm text-ink outline-none transition",
    "placeholder:text-ink/35 focus:ring-2 focus:ring-moss/40 disabled:opacity-60",
    invalid
      ? "border-red-400 focus:border-red-400"
      : "border-dark-green/15 focus:border-moss",
  );
}
