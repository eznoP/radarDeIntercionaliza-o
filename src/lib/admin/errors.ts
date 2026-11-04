/** Traduz erros comuns do Postgres/Supabase para mensagens amigáveis. */
export function dbErrorMessage(error: { code?: string; message: string }): string {
  switch (error.code) {
    case "23505":
      return "Já existe um registro com este valor. Verifique o nome ou o slug.";
    case "23503":
      return "Registro relacionado não encontrado. Recarregue a página e tente novamente.";
    case "23502":
      return "Preencha todos os campos obrigatórios.";
    case "22P02":
      return "Um dos valores informados é inválido.";
    default:
      return `Não foi possível salvar: ${error.message}`;
  }
}
