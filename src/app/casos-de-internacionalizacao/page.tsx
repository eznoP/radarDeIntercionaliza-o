import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Casos de internacionalização",
  description:
    "Artigos com casos reais de internacionalização.",
};

export default function Page() {
  return (
    <ContentPage
      title="Casos de internacionalização"
      watermark="/brand/containers2.webp"
    >
      <p>
        Nesta seção, apresentamos experiências e trajetórias de empresas e
        organizações maranhenses que desenvolveram ou estão desenvolvendo ações
        de internacionalização. Os conteúdos destacam as práticas adotadas, os
        desafios enfrentados e os resultados alcançados, mostrando como negócios
        do estado conquistaram espaço em mercados além das fronteiras.
      </p>
      <p>
        Ao dar visibilidade a essas histórias, o Radar inspira novos
        empreendedores a enxergar o comércio exterior como caminho possível para
        o crescimento. Os casos também funcionam como material de aprendizagem
        para estudantes, gestores e empresários interessados em ampliar a
        presença do Maranhão no mercado internacional.
      </p>
    </ContentPage>
  );
}
