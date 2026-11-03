import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Painel de indicadores" };

export default function Page() {
  return (
    <ComingSoon
      title="Painel de indicadores"
      description="Dados quantitativos e cotações de moedas atualizados."
    />
  );
}
