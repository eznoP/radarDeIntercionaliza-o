import type { FormState } from "@/lib/admin/types";

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "error" && state.message) {
    return (
      <p
        role="alert"
        className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
      >
        {state.message}
      </p>
    );
  }
  if (state.status === "success" && state.message) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
        {state.message}
      </p>
    );
  }
  return null;
}
