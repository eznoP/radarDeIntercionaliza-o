import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Podcast",
  description:
    "Entrevistas estruturadas com profissionais do comércio exterior, relações internacionais e economia.",
};

export default function Page() {
  return (
    <ContentPage title="Podcast" watermark="/brand/globos-fala.webp">
      <p>
        Nesta seção, o podcast Radar Global apresenta entrevistas estruturadas
        com profissionais de diversas áreas ligadas ao comércio exterior,
        relações internacionais e economia. O objetivo do recurso audiovisual é
        divulgar, de forma acessível, discussões assertivas e enriquecedoras
        sobre temas relevantes para os contextos acadêmico e profissional. Por
        meio de uma linguagem simples, porém formal, os episódios trazem
        análises profundas e dinâmicas.
      </p>
      <p>
        Temáticas como o comércio exterior maranhense, câmbio e gestão de risco
        para exportadores, política comercial brasileira, diplomacia econômica,
        além da bioeconomia e produtos da sociobiodiversidade amazônica, são
        alguns dos tópicos debatidos no programa.
      </p>
    </ContentPage>
  );
}
