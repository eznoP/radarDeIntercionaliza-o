/**
 * Cotações das principais moedas em relação ao real.
 * Fonte: AwesomeAPI (economia.awesomeapi.com.br), sem chave.
 * Cache de 5 minutos no servidor para não consultar a API a cada visita.
 */

export type Cotacao = {
  code: string;
  nome: string;
  /** Valor de 1 unidade da moeda em reais (compra). */
  bid: number;
  /** Variação percentual em relação ao fechamento anterior. */
  variacao: number;
  /** Horário da cotação informado pela API. */
  atualizadoEm: Date;
};

type AwesomeResposta = Record<
  string,
  {
    code: string;
    name: string;
    bid: string;
    pctChange: string;
    create_date: string;
  }
>;

const MOEDAS: { par: string; code: string; nome: string }[] = [
  { par: "USD-BRL", code: "USD", nome: "Dólar" },
  { par: "EUR-BRL", code: "EUR", nome: "Euro" },
  { par: "SAR-BRL", code: "SAR", nome: "Rial Saudita" },
  { par: "CAD-BRL", code: "CAD", nome: "Dólar Canadense" },
  { par: "CNY-BRL", code: "CNY", nome: "Renminbi (Yuan)" },
  { par: "INR-BRL", code: "INR", nome: "Rúpia Indiana" },
];

const URL = `https://economia.awesomeapi.com.br/last/${MOEDAS.map((m) => m.par).join(",")}`;

/** Busca as cotações; retorna lista vazia se a API falhar. */
export async function getCotacoes(): Promise<Cotacao[]> {
  try {
    const res = await fetch(URL, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];

    const json = (await res.json()) as AwesomeResposta;
    const cotacoes: Cotacao[] = [];

    for (const moeda of MOEDAS) {
      const item = json[`${moeda.code}BRL`];
      if (!item) continue;
      const bid = Number(item.bid);
      const variacao = Number(item.pctChange);
      if (!Number.isFinite(bid)) continue;
      cotacoes.push({
        code: moeda.code,
        nome: moeda.nome,
        bid,
        variacao: Number.isFinite(variacao) ? variacao : 0,
        atualizadoEm: new Date(item.create_date.replace(" ", "T") + "-03:00"),
      });
    }

    return cotacoes;
  } catch {
    return [];
  }
}

/** Formata o valor em reais; moedas de baixo valor ganham mais casas. */
export function formatarBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: valor < 1 ? 4 : 2,
  }).format(valor);
}

/** Formata a variação percentual com sinal. */
export function formatarVariacao(valor: number): string {
  const sinal = valor > 0 ? "+" : "";
  return `${sinal}${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

/** Horário de Brasília no formato HH:mm. */
export function formatarHora(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}
