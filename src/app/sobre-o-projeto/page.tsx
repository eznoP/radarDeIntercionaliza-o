import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Sobre o projeto",
  description:
    "A história, os objetivos e a proposta do Radar de Internacionalização.",
};

export default function Page() {
  return (
    <ContentPage
      title="Sobre o projeto"
      watermark="/brand/compass-rose.webp"
    >
      <p>
        O Radar de Internacionalização nasceu da necessidade da difusão do
        conhecimento e fortalecimento da cultura de internacionalização no
        Maranhão e buscará democratizar o acesso a informações e conhecimentos
        sobre o tema, aproximando universidade, setor produtivo e sociedade por
        meio de ações extensionistas de formação, comunicação e difusão do
        conhecimento.
      </p>
      <p>
        Nossas atividades incluem a organização e a divulgação de informações
        estratégicas sobre comércio exterior, a produção de indicadores e a
        elaboração de estudos de caso sobre processos de internacionalização.
        Também fazem parte da iniciativa o Radar Cast (podcast sobre
        internacionalização), a Newsletter Radar (com divulgação periódica de
        conteúdos) e a realização de mesas-redondas e ações de interação com a
        comunidade, visando promover o diálogo e a troca de experiências.
      </p>
      <p>
        Acompanhe o Radar e descubra como o Maranhão pode se conectar ainda mais
        com o mundo.
      </p>
    </ContentPage>
  );
}
