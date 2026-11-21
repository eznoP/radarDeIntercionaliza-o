import { NextResponse } from "next/server";

/** Diagnóstico temporário: testa a AwesomeAPI a partir do runtime da Vercel. */
export const dynamic = "force-dynamic";

export async function GET() {
  const url = "https://economia.awesomeapi.com.br/last/USD-BRL";
  const started = Date.now();
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const body = await res.text();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      ms: Date.now() - started,
      sample: body.slice(0, 300),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        ms: Date.now() - started,
        error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
        cause:
          error && typeof error === "object" && "cause" in error
            ? String((error as { cause?: unknown }).cause)
            : null,
      },
      { status: 500 },
    );
  }
}
