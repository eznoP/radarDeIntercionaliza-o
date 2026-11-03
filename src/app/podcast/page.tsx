import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Podcast" };

export default function Page() {
  return (
    <ComingSoon
      title="Podcast"
      description="Episódios do nosso podcast, com player integrado na página."
    />
  );
}
