/**
 * Acesso do integrante -> e-mail interno do Supabase Auth.
 *
 * O Supabase Auth só autentica por e-mail, então o "acesso" digitado na tela
 * de login é convertido para um e-mail interno (sem entrega de mensagens).
 * Se o valor já contiver "@", ele é tratado como e-mail literal — assim o
 * acesso antigo do gestor (gestoradm@admin.com) continua funcionando.
 */

export const INTEGRANTE_EMAIL_DOMAIN = "integrantes.radar";

/** Regras do campo "acesso": letras, números, ponto, hífen e sublinhado. */
const ACCESS_RE = /^[a-z0-9](?:[a-z0-9._-]{1,38})[a-z0-9]$/;

/** Normaliza um acesso para minúsculas e sem espaços nas pontas. */
export function normalizeAccess(value: string): string {
  return value.trim().toLowerCase();
}

/** Valida o formato do acesso (ou aceita um e-mail completo). */
export function isValidAccess(value: string): boolean {
  const v = normalizeAccess(value);
  if (!v) return false;
  if (v.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  return ACCESS_RE.test(v);
}

/** Mensagem amigável quando o acesso é inválido. */
export const ACCESS_HINT =
  "Use de 3 a 40 caracteres: letras, números, ponto, hífen ou sublinhado.";

/**
 * Converte o acesso no e-mail usado pelo Supabase Auth.
 * "joao.silva" -> "joao.silva@integrantes.radar"
 */
export function accessToEmail(access: string): string {
  const v = normalizeAccess(access);
  return v.includes("@") ? v : `${v}@${INTEGRANTE_EMAIL_DOMAIN}`;
}
