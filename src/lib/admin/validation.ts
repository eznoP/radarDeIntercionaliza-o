import type { FieldErrors } from "@/lib/admin/types";

/** Lê e valida um campo de texto obrigatório. */
export function requiredText(
  formData: FormData,
  field: string,
  label: string,
  errors: FieldErrors,
): string {
  const raw = formData.get(field);
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) errors[field] = `Insira o/a ${label}`;
  return value;
}

/** Lê um campo de texto opcional. */
export function optionalText(formData: FormData, field: string): string {
  const raw = formData.get(field);
  return typeof raw === "string" ? raw.trim() : "";
}

/** Lê um checkbox (retorna boolean). */
export function checkbox(formData: FormData, field: string): boolean {
  const raw = formData.get(field);
  return raw === "on" || raw === "true" || raw === "1";
}

/** Lança se houver erros de validação (interrompe a ação). */
export function assertValid(errors: FieldErrors) {
  if (Object.keys(errors).length > 0) {
    const err = new Error("VALIDATION") as Error & { fieldErrors: FieldErrors };
    err.fieldErrors = errors;
    throw err;
  }
}
