import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Integrantes" };

export default function Page() {
  return (
    <ComingSoon
      title="Integrantes"
      description="Conheça as pessoas que constroem o Radar de Internacionalização."
    />
  );
}
