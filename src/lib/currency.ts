/**
 * Cotações das principais moedas em relação ao real.
 * Fonte principal: Currency API (cdn.jsdelivr.net), sem chave.
 * Fonte de reserva: open.er-api.com.
 * As taxas são publicadas uma vez por dia; o cache de 5 minutos evita
 * consultas repetidas ao longo do dia.
 */

export type Cotacao = {
  code: string;
  nome: string;
  /** Valor de 1 unidade da moeda em reais. */
  bid: number;
  /** Variação percentual em relação ao dia anterior (null se indisponível). */
  variacao: number | null;
  /** Data de referência da cotação. */
  referencia: Date;
};

type BrlFile = { date: string; brl: Record<string, number> };

type ErApi = {
  result: string;
  rates: Record<string, number>;
  time_last_update_unix: number;
};

const MOEDAS: { code: string; nome: string; chave: string }[] = [
  { code: "USD", nome: "Dólar", chave: "usd" },
  { code: "EUR", nome: "Euro", chave: "eur" },
  { code: "SAR", nome: "Rial Saudita", chave: "sar" },
  { code: "CAD", nome: "Dólar Canadense", chave: "cad" },
  { code: "CNY", nome: "Renminbi (Yuan)", chave: "cny" },
  { code: "INR", nome: "Rúpia Indiana", chave: "inr" },
];

const CDN = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api";

/** Busca o arquivo diário do Currency API para uma data (ou "latest"). */
async function buscarArquivo(data: string): Promise<BrlFile | null> {
  try {
    const res = await fetch(`${CDN}@${data}/v1/currencies/brl.json`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as BrlFile;
    return json?.brl ? json : null;
  } catch {
    return null;
  }
}

/** Data (YYYY-MM-DD) deslocada em dias. */
function deslocar(dia: string, dias: number): string {
  const d = new Date(`${dia}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

async function viaCurrencyApi(): Promise<Cotacao[]> {
  const atual = await buscarArquivo("latest");
  if (!atual) return [];

  // Variação em relação ao dia anterior publicado (até 3 dias atrás,
  // cobrindo fins de semana).
  let anterior: BrlFile | null = null;
  for (let i = 1; i <= 3 && !anterior; i++) {
    anterior = await buscarArquivo(deslocar(atual.date, -i));
  }

  const cotacoes: Cotacao[] = [];
  for (const moeda of MOEDAS) {
    const taxa = atual.brl[moeda.chave];
    if (!Number.isFinite(taxa) || taxa <= 0) continue;

    const bid = 1 / taxa;
    const taxaAnterior = anterior?.brl[moeda.chave];
    const variacao =
      typeof taxaAnterior === "number" && taxaAnterior > 0
        ? (taxaAnterior / taxa - 1) * 100
        : null;

    cotacoes.push({
      code: moeda.code,
      nome: moeda.nome,
      bid,
      variacao,
      referencia: new Date(`${atual.date}T12:00:00Z`),
    });
  }

  return cotacoes;
}

async function viaErApi(): Promise<Cotacao[]> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/BRL", {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as ErApi;
    if (json.result !== "success" || !json.rates) return [];

    const referencia = new Date(json.time_last_update_unix * 1000);
    return MOEDAS.flatMap((moeda) => {
      const taxa = json.rates[moeda.code];
      if (!Number.isFinite(taxa) || taxa <= 0) return [];
      return [
        {
          code: moeda.code,
          nome: moeda.nome,
          bid: 1 / taxa,
          variacao: null,
          referencia,
        },
      ];
    });
  } catch (error) {
    console.error("[cotacoes] falha na fonte de reserva:", error);
    return [];
  }
}

/** Busca as cotações; retorna lista vazia se todas as fontes falharem. */
export async function getCotacoes(): Promise<Cotacao[]> {
  const principal = await viaCurrencyApi();
  if (principal.length === MOEDAS.length) return principal;

  const reserva = await viaErApi();
  return reserva.length > 0 ? reserva : principal;
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

/** Data de referência no formato DD/MM. */
export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}
