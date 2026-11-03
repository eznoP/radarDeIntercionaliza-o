import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Casos de internacionalização" };

export default function Page() {
  return (
    <ComingSoon
      title="Casos de internacionalização"
      description="Artigos com casos reais de internacionalização."
    />
  );
}
