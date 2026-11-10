import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Radar de tendências",
  description:
    "Notícias curtas sobre o que está em alta no comércio exterior e na economia.",
};

export default function Page() {
  return (
    <ContentPage
      title="Radar de tendências"
      watermark="/brand/globo-vintage-aviao.webp"
    >
      <p>
        Nesta seção, o Radar de Tendências apresenta, por meio de notícias curtas
        temáticas, assuntos em alta no comércio exterior, internacionalização,
        paradiplomacia e economia. O intuito do material é disseminar, de forma
        clara e exploratória, tópicos pungentes com o compromisso de sempre
        utilizar referências verídicas, levando conteúdos fundamentais de modo
        educativo para o público.
      </p>
    </ContentPage>
  );
}
