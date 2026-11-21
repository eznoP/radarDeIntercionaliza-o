import { TrendingDown, TrendingUp } from "lucide-react";
import {
  formatarBRL,
  formatarHora,
  formatarVariacao,
  getCotacoes,
} from "@/lib/currency";

/**
 * Cotações das principais moedas em reais.
 * Renderizada no servidor com cache de 5 minutos; some da página se a API falhar.
 */
export async function CurrencyQuotes() {
  const cotacoes = await getCotacoes();
  if (cotacoes.length === 0) return null;

  return (
    <section aria-labelledby="cotacoes-titulo">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="cotacoes-titulo"
            className="font-display text-xl font-bold text-dark-green"
          >
            Cotações de moedas
          </h2>
          <p className="mt-1 font-body text-sm text-ink/50">
            Valores de referência em reais, atualizados automaticamente.
          </p>
        </div>
        <p className="font-body text-xs text-ink/40">Fonte: AwesomeAPI</p>
      </div>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cotacoes.map((c) => {
          const alta = c.variacao > 0;
          const baixa = c.variacao < 0;
          return (
            <li
              key={c.code}
              className="rounded-card border border-dark-green/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-moss/15 px-2.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wide text-dark-green">
                  {c.code}
                </span>
                <span
                  className={
                    alta
                      ? "inline-flex items-center gap-1 font-display text-xs font-semibold text-emerald-600"
                      : baixa
                        ? "inline-flex items-center gap-1 font-display text-xs font-semibold text-red-600"
                        : "inline-flex items-center gap-1 font-display text-xs font-semibold text-ink/50"
                  }
                >
                  {alta && <TrendingUp className="h-3.5 w-3.5" />}
                  {baixa && <TrendingDown className="h-3.5 w-3.5" />}
                  {formatarVariacao(c.variacao)}
                </span>
              </div>

              <p className="mt-3 font-body text-sm text-ink/60">{c.nome}</p>
              <p className="mt-0.5 font-display text-2xl font-bold text-dark-green">
                {formatarBRL(c.bid)}
              </p>
              <p className="mt-2 font-body text-[11px] text-ink/40">
                Atualizado às {formatarHora(c.atualizadoEm)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
