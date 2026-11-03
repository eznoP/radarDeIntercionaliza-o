import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Mapas interativos globais" };

export default function Page() {
  return (
    <ComingSoon
      title="Mapas interativos globais"
      description="Explore dados de comércio exterior e internacionalização em mapas interativos."
    />
  );
}
