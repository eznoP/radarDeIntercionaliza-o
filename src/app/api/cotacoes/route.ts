import { NextResponse } from "next/server";

/** Diagnóstico temporário: testa as fontes de câmbio a partir do runtime da Vercel. */
export const dynamic = "force-dynamic";

const URLS = {
  currencyApi:
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/brl.json",
  erApi: "https://open.er-api.com/v6/latest/BRL",
  awesomeApi: "https://economia.awesomeapi.com.br/last/USD-BRL",
};

async function testar(url: string) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const body = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      ms: Date.now() - started,
      sample: body.slice(0, 160),
    };
  } catch (error) {
    return {
      ok: false,
      ms: Date.now() - started,
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      cause:
        error && typeof error === "object" && "cause" in error
          ? String((error as { cause?: unknown }).cause)
          : null,
    };
  }
}

export async function GET() {
  const [currencyApi, erApi, awesomeApi] = await Promise.all([
    testar(URLS.currencyApi),
    testar(URLS.erApi),
    testar(URLS.awesomeApi),
  ]);
  return NextResponse.json({ currencyApi, erApi, awesomeApi });
}
