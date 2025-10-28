export interface CID {
  code: string;
  description: string;
}

export const cidsOdontologicos: CID[] = [
  // K00 - Distúrbios do desenvolvimento e da erupção dos dentes
  { code: "K00.0", description: "Anodontia" },
  { code: "K00.1", description: "Dentes supranumerários" },
  { code: "K00.2", description: "Anomalias do tamanho e da forma dos dentes" },
  { code: "K00.3", description: "Dentes manchados" },
  { code: "K00.4", description: "Distúrbios na formação dos dentes" },
  { code: "K00.6", description: "Distúrbios da erupção dentária" },
  { code: "K00.7", description: "Síndrome da erupção dentária" },
  
  // K01 - Dentes inclusos e impactados
  { code: "K01.0", description: "Dentes inclusos" },
  { code: "K01.1", description: "Dentes impactados" },
  
  // K02 - Cárie dentária
  { code: "K02.0", description: "Cárie limitada ao esmalte" },
  { code: "K02.1", description: "Cárie da dentina" },
  { code: "K02.2", description: "Cárie do cemento" },
  { code: "K02.3", description: "Cárie dentária estacionária" },
  { code: "K02.4", description: "Odontoclasia" },
  { code: "K02.8", description: "Outras cáries dentárias" },
  { code: "K02.9", description: "Cárie dentária, não especificada" },
  
  // K03 - Outras doenças dos tecidos duros dos dentes
  { code: "K03.0", description: "Atrito dentário excessivo" },
  { code: "K03.1", description: "Abrasão dentária" },
  { code: "K03.2", description: "Erosão dentária" },
  { code: "K03.3", description: "Reabsorção patológica dos dentes" },
  { code: "K03.4", description: "Hipercementose" },
  { code: "K03.5", description: "Ancilose dentária" },
  { code: "K03.6", description: "Depósitos [acréscimos] nos dentes" },
  { code: "K03.7", description: "Alterações pós-eruptivas da cor dos tecidos duros dos dentes" },
  
  // K04 - Doenças da polpa e dos tecidos periapicais
  { code: "K04.0", description: "Pulpite" },
  { code: "K04.1", description: "Necrose da polpa" },
  { code: "K04.2", description: "Degeneração da polpa" },
  { code: "K04.3", description: "Formação anormal de tecido duro na polpa" },
  { code: "K04.4", description: "Periodontite apical aguda de origem pulpar" },
  { code: "K04.5", description: "Periodontite apical crônica" },
  { code: "K04.6", description: "Abscesso periapical com fístula" },
  { code: "K04.7", description: "Abscesso periapical sem fístula" },
  { code: "K04.8", description: "Cisto radicular" },
  
  // K05 - Gengivite e doenças periodontais
  { code: "K05.0", description: "Gengivite aguda" },
  { code: "K05.1", description: "Gengivite crônica" },
  { code: "K05.2", description: "Periodontite aguda" },
  { code: "K05.3", description: "Periodontite crônica" },
  { code: "K05.4", description: "Periodontose" },
  { code: "K05.5", description: "Outras doenças periodontais" },
  
  // K06 - Outros transtornos da gengiva e do rebordo alveolar sem dentes
  { code: "K06.0", description: "Retração gengival" },
  { code: "K06.1", description: "Hiperplasia gengival" },
  { code: "K06.2", description: "Lesões da gengiva e do rebordo alveolar sem dentes, associadas a traumatismos" },
  { code: "K06.8", description: "Outros transtornos especificados da gengiva e do rebordo alveolar sem dentes" },
  
  // K07 - Anomalias dentofaciais
  { code: "K07.0", description: "Anomalias evidentes do tamanho dos maxilares" },
  { code: "K07.1", description: "Anomalias da relação entre maxila e mandíbula" },
  { code: "K07.2", description: "Anomalias da relação entre os arcos dentários" },
  { code: "K07.3", description: "Anomalias da posição dos dentes" },
  { code: "K07.4", description: "Maloclusão, não especificada" },
  { code: "K07.5", description: "Anomalias dentofaciais funcionais" },
  { code: "K07.6", description: "Transtornos da articulação temporomandibular" },
  
  // K08 - Outros transtornos dos dentes e de suas estruturas de sustentação
  { code: "K08.0", description: "Exfoliação dos dentes devida a causas sistêmicas" },
  { code: "K08.1", description: "Perda de dentes devida a acidente, extração ou doença periodontal local" },
  { code: "K08.2", description: "Atrofia do rebordo alveolar sem dentes" },
  { code: "K08.3", description: "Raiz dentária retida" },
  { code: "K08.8", description: "Outros transtornos especificados dos dentes e das estruturas de sustentação" },
  
  // K09 - Cistos da região oral
  { code: "K09.0", description: "Cistos odontogênicos de desenvolvimento" },
  { code: "K09.1", description: "Cistos de desenvolvimento (não-odontogênicos) da região oral" },
  { code: "K09.2", description: "Outros cistos dos maxilares" },
  { code: "K09.8", description: "Outros cistos da região oral, não classificados em outra parte" },
  
  // K10 - Outras doenças dos maxilares
  { code: "K10.0", description: "Transtornos do desenvolvimento dos maxilares" },
  { code: "K10.1", description: "Granuloma central de células gigantes" },
  { code: "K10.2", description: "Afecções inflamatórias dos maxilares" },
  { code: "K10.3", description: "Alveolite maxilar" },
  { code: "K10.8", description: "Outras doenças especificadas dos maxilares" },
  
  // K11 - Doenças das glândulas salivares
  { code: "K11.0", description: "Atrofia de glândula salivar" },
  { code: "K11.1", description: "Hipertrofia de glândula salivar" },
  { code: "K11.2", description: "Sialadenite" },
  { code: "K11.3", description: "Abscesso de glândula salivar" },
  { code: "K11.4", description: "Fístula de glândula salivar" },
  { code: "K11.5", description: "Sialolitíase" },
  { code: "K11.6", description: "Mucocele de glândula salivar" },
  { code: "K11.7", description: "Transtornos da secreção salivar" },
  
  // K12 - Estomatite e lesões afins
  { code: "K12.0", description: "Aftas bucais recorrentes" },
  { code: "K12.1", description: "Outras formas de estomatite" },
  { code: "K12.2", description: "Celulite e abscesso da boca" },
  
  // K13 - Outras doenças do lábio e da mucosa oral
  { code: "K13.0", description: "Doenças dos lábios" },
  { code: "K13.1", description: "Mordedura da mucosa das bochechas e dos lábios" },
  { code: "K13.2", description: "Leucoplasia e outras alterações do epitélio oral" },
  { code: "K13.3", description: "Leucoplasia pilosa" },
  { code: "K13.4", description: "Granuloma e lesões semelhantes da mucosa oral" },
  { code: "K13.5", description: "Fibrose da submucosa oral" },
  { code: "K13.6", description: "Hiperplasia irritativa da mucosa oral" },
  { code: "K13.7", description: "Outras lesões e as não especificadas da mucosa oral" },
  
  // K14 - Doenças da língua
  { code: "K14.0", description: "Glossite" },
  { code: "K14.1", description: "Língua geográfica" },
  { code: "K14.2", description: "Glossite rombóide mediana" },
  { code: "K14.3", description: "Hipertrofia das papilas linguais" },
  { code: "K14.4", description: "Atrofia das papilas linguais" },
  { code: "K14.5", description: "Língua escrotal" },
  { code: "K14.6", description: "Glossodínia" },
  { code: "K14.8", description: "Outras doenças da língua" },
];
