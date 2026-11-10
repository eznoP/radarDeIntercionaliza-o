/** Função do integrante no projeto (escolha única, lista fechada). */
export type MemberFuncao = "bolsista" | "bolsista_voluntario" | "extensionista";

export const FUNCOES: { value: MemberFuncao; label: string }[] = [
  { value: "bolsista", label: "Bolsista" },
  { value: "bolsista_voluntario", label: "Bolsista Voluntário" },
  { value: "extensionista", label: "Extensionista" },
];

export const FUNCAO_VALUES = FUNCOES.map((f) => f.value);

export function funcaoLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return FUNCOES.find((f) => f.value === value)?.label ?? null;
}
