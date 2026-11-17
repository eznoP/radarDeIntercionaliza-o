/** Função do integrante no projeto (escolha única, lista fechada). */
export type MemberFuncao =
  | "orientadora"
  | "desenvolvedor"
  | "bolsista"
  | "bolsista_voluntario"
  | "extensionista";

export const FUNCOES: { value: MemberFuncao; label: string }[] = [
  { value: "orientadora", label: "Orientadora" },
  { value: "desenvolvedor", label: "Desenvolvedor" },
  { value: "bolsista", label: "Bolsista" },
  { value: "bolsista_voluntario", label: "Bolsista Voluntário" },
  { value: "extensionista", label: "Extensionista" },
];

/** Ordem dos grupos na página de integrantes (topo → fim). */
export const FUNCAO_ORDEM: MemberFuncao[] = [
  "orientadora",
  "desenvolvedor",
  "bolsista",
  "bolsista_voluntario",
  "extensionista",
];

export const FUNCAO_VALUES = FUNCOES.map((f) => f.value);

export function funcaoLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return FUNCOES.find((f) => f.value === value)?.label ?? null;
}
