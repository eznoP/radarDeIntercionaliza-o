import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Painel de indicadores",
  description:
    "Dados quantitativos e cotações de moedas atualizados.",
};

export default function Page() {
  return (
    <ContentPage
      title="Painel de indicadores"
      watermark="/brand/containers.webp"
    >
      <p>
        Nesta seção, o Painel de Indicadores do Radar de Internacionalização
        busca a ampliação do acesso a informações qualificadas sobre o comércio
        exterior maranhense. Reunindo dados de cotações, exportações,
        importações e principais mercados de forma clara e acessível, ele apoia
        empresas, pesquisadores e gestores públicos na compreensão do desempenho
        do Maranhão no cenário global e na identificação de oportunidades para os
        setores produtivos do estado.
      </p>
      <p>
        Além de ser uma fonte de consulta, o painel estimula a cultura de
        negócios internacionais no contexto regional e fortalece a aproximação
        entre universidade e comunidade. Os docentes e discentes têm a
        oportunidade de vivenciar, na prática, a análise, a produção e a difusão
        do conhecimento, o que contribui para a formação acadêmica e para o
        desenvolvimento do Maranhão.
      </p>
    </ContentPage>
  );
}
