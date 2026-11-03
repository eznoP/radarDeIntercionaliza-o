import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Sobre nós" };

export default function Page() {
  return (
    <ComingSoon
      title="Sobre nós"
      description="Conheça o projeto e a equipe do Radar de Internacionalização."
    />
  );
}
