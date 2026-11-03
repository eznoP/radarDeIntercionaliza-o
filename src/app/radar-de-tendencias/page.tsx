import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Radar de tendências" };

export default function Page() {
  return (
    <ComingSoon
      title="Radar de tendências"
      description="Acompanhe as notícias mais relevantes de comércio exterior."
    />
  );
}
