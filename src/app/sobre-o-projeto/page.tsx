import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Sobre o projeto" };

export default function Page() {
  return (
    <ComingSoon
      title="Sobre o projeto"
      description="A história, os objetivos e a proposta do Radar de Internacionalização."
    />
  );
}
