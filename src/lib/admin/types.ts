export type FieldErrors = Record<string, string>;

/** Estado retornado pelas Server Actions para os formulários do painel. */
export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: FieldErrors;
};

export const initialFormState: FormState = { status: "idle" };

export function errorState(
  message: string,
  fieldErrors?: FieldErrors,
): FormState {
  return { status: "error", message, fieldErrors };
}

export function successState(message?: string): FormState {
  return { status: "success", message };
}
