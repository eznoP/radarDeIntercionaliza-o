import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Mapas interativos globais",
  description:
    "Explore dados de comércio exterior e internacionalização em mapas interativos.",
};

export default function Page() {
  return (
    <ContentPage
      title="Mapas interativos globais"
      watermark="/brand/mapamundi.webp"
    >
      <p>
        Nesta seção, o Radar de Internacionalização desenvolverá os Mapas
        Interativos Globais, uma ferramenta que coloca o comércio exterior
        maranhense em foco e o apresenta de maneira visual, acessível e de fácil
        exploração. Os mapas serão resultado do monitoramento contínuo de dados
        qualitativos e quantitativos realizado pelo projeto e estarão disponíveis
        neste ambiente digital. A proposta é permitir que o leitor visualize a
        presença do Maranhão no mercado internacional e compreenda como
        determinados segmentos do setor produtivo do estado se relacionam com o
        restante do mundo, oferecendo uma base para análises comparativas.
      </p>
      <p>
        A ferramenta é voltada especialmente para empresas, startups e
        instituições que desejam expandir suas marcas para o mercado
        internacional, bem como para estudantes, professores, pesquisadores e
        demais pessoas interessadas no tema. Ao transformar dados em informação
        clara e visual, os mapas contribuem para ampliar o acesso ao conhecimento
        sobre comércio exterior e fortalecer a cultura de internacionalização no
        Maranhão.
      </p>
    </ContentPage>
  );
}
