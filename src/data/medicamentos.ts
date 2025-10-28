// Banco de medicamentos odontológicos com posologias padrão

export interface Medicamento {
  nome: string;
  categoria: string;
  concentracao: string;
  posologia_adulto: string;
  posologia_crianca: string;
  indicacao: string;
}

export const medicamentos: Medicamento[] = [
  // ANALGÉSICOS E ANTIINFLAMATÓRIOS
  {
    nome: "Paracetamol",
    categoria: "Analgésico",
    concentracao: "500mg e 750mg",
    posologia_adulto: "500-750mg a cada 6 horas (máx 3g/dia)",
    posologia_crianca: "10-15mg/kg a cada 4-6 horas (máx 60mg/kg/dia)",
    indicacao: "Dor leve a moderada, febre"
  },
  {
    nome: "Dipirona Sódica",
    categoria: "Analgésico",
    concentracao: "500mg",
    posologia_adulto: "500mg a cada 6 horas",
    posologia_crianca: "10mg/kg a cada 6 horas",
    indicacao: "Dor e febre"
  },
  {
    nome: "Ibuprofeno",
    categoria: "Antiinflamatório",
    concentracao: "200mg, 400mg, 600mg",
    posologia_adulto: "400-600mg a cada 6-8 horas (máx 2.4g/dia)",
    posologia_crianca: "5-10mg/kg a cada 6-8 horas (máx 40mg/kg/dia)",
    indicacao: "Dor, inflamação, febre"
  },
  {
    nome: "Nimesulida",
    categoria: "Antiinflamatório",
    concentracao: "100mg",
    posologia_adulto: "100mg a cada 12 horas",
    posologia_crianca: "Não recomendado < 12 anos",
    indicacao: "Dor e inflamação"
  },
  {
    nome: "Diclofenaco de Potássio",
    categoria: "Antiinflamatório",
    concentracao: "50mg",
    posologia_adulto: "50mg a cada 8 horas",
    posologia_crianca: "1-3mg/kg/dia dividido em 2-3 doses",
    indicacao: "Dor e inflamação moderada a severa"
  },
  {
    nome: "Diclofenaco de Sódio",
    categoria: "Antiinflamatório",
    concentracao: "50mg",
    posologia_adulto: "50mg a cada 8-12 horas",
    posologia_crianca: "Não recomendado < 14 anos",
    indicacao: "Dor e inflamação"
  },
  {
    nome: "Cetoprofeno",
    categoria: "Antiinflamatório",
    concentracao: "50mg, 100mg",
    posologia_adulto: "50-100mg a cada 8-12 horas (máx 300mg/dia)",
    posologia_crianca: "Não recomendado < 15 anos",
    indicacao: "Dor e inflamação pós-operatória"
  },
  {
    nome: "Meloxicam",
    categoria: "Antiinflamatório",
    concentracao: "7.5mg, 15mg",
    posologia_adulto: "7.5-15mg uma vez ao dia",
    posologia_crianca: "Não recomendado < 15 anos",
    indicacao: "Dor e inflamação crônica"
  },
  {
    nome: "Naproxeno",
    categoria: "Antiinflamatório",
    concentracao: "250mg, 500mg",
    posologia_adulto: "250-500mg a cada 12 horas",
    posologia_crianca: "5mg/kg a cada 12 horas (> 5 anos)",
    indicacao: "Dor e inflamação"
  },
  {
    nome: "Piroxicam",
    categoria: "Antiinflamatório",
    concentracao: "20mg",
    posologia_adulto: "20mg uma vez ao dia",
    posologia_crianca: "Não recomendado < 15 anos",
    indicacao: "Dor e inflamação prolongada"
  },

  // ANTIBIÓTICOS
  {
    nome: "Amoxicilina",
    categoria: "Antibiótico",
    concentracao: "500mg",
    posologia_adulto: "500mg a cada 8 horas por 7-10 dias",
    posologia_crianca: "25-50mg/kg/dia dividido a cada 8 horas",
    indicacao: "Infecções bacterianas leves a moderadas"
  },
  {
    nome: "Amoxicilina + Clavulanato",
    categoria: "Antibiótico",
    concentracao: "500mg + 125mg, 875mg + 125mg",
    posologia_adulto: "500+125mg a cada 8h ou 875+125mg a cada 12h por 7-10 dias",
    posologia_crianca: "25-45mg/kg/dia dividido a cada 12 horas",
    indicacao: "Infecções bacterianas resistentes"
  },
  {
    nome: "Azitromicina",
    categoria: "Antibiótico",
    concentracao: "500mg",
    posologia_adulto: "500mg no 1º dia, depois 250mg/dia por 4 dias",
    posologia_crianca: "10mg/kg no 1º dia, depois 5mg/kg/dia por 4 dias",
    indicacao: "Infecções bacterianas, alternativa à penicilina"
  },
  {
    nome: "Clindamicina",
    categoria: "Antibiótico",
    concentracao: "300mg, 600mg",
    posologia_adulto: "300mg a cada 6-8 horas por 7-10 dias",
    posologia_crianca: "10-25mg/kg/dia dividido a cada 6-8 horas",
    indicacao: "Infecções odontogênicas graves, alérgicos à penicilina"
  },
  {
    nome: "Cefalexina",
    categoria: "Antibiótico",
    concentracao: "500mg",
    posologia_adulto: "500mg a cada 6 horas por 7-10 dias",
    posologia_crianca: "25-50mg/kg/dia dividido a cada 6 horas",
    indicacao: "Infecções bacterianas"
  },
  {
    nome: "Metronidazol",
    categoria: "Antibiótico",
    concentracao: "250mg, 400mg",
    posologia_adulto: "250-400mg a cada 8 horas por 7-10 dias",
    posologia_crianca: "15-30mg/kg/dia dividido a cada 8 horas",
    indicacao: "Infecções anaeróbicas, pericoronarite"
  },
  {
    nome: "Ciprofloxacino",
    categoria: "Antibiótico",
    concentracao: "500mg",
    posologia_adulto: "500mg a cada 12 horas por 7-10 dias",
    posologia_crianca: "Não recomendado < 18 anos",
    indicacao: "Infecções bacterianas resistentes"
  },
  {
    nome: "Doxiciclina",
    categoria: "Antibiótico",
    concentracao: "100mg",
    posologia_adulto: "100mg a cada 12 horas por 7-14 dias",
    posologia_crianca: "Não recomendado < 8 anos; > 8 anos: 2-4mg/kg/dia",
    indicacao: "Doença periodontal, alternativa à penicilina"
  },
  {
    nome: "Espiramicina",
    categoria: "Antibiótico",
    concentracao: "500mg",
    posologia_adulto: "500mg a cada 8 horas por 7 dias",
    posologia_crianca: "50-100mg/kg/dia dividido a cada 8 horas",
    indicacao: "Infecções odontogênicas"
  },
  {
    nome: "Levofloxacino",
    categoria: "Antibiótico",
    concentracao: "500mg",
    posologia_adulto: "500mg uma vez ao dia por 7-10 dias",
    posologia_crianca: "Não recomendado < 18 anos",
    indicacao: "Infecções bacterianas graves"
  },

  // ANTIFÚNGICOS
  {
    nome: "Nistatina Suspensão Oral",
    categoria: "Antifúngico",
    concentracao: "100.000 UI/mL",
    posologia_adulto: "5mL (500.000 UI) 4x/dia por 7-14 dias - Bochechar e engolir",
    posologia_crianca: "2-5mL 4x/dia por 7-14 dias",
    indicacao: "Candidíase oral"
  },
  {
    nome: "Fluconazol",
    categoria: "Antifúngico",
    concentracao: "150mg",
    posologia_adulto: "150mg dose única ou 50-100mg/dia por 7-14 dias",
    posologia_crianca: "3-6mg/kg dose única ou por 7-14 dias",
    indicacao: "Candidíase oral e sistêmica"
  },
  {
    nome: "Itraconazol",
    categoria: "Antifúngico",
    concentracao: "100mg",
    posologia_adulto: "100-200mg uma vez ao dia por 7-14 dias",
    posologia_crianca: "3-5mg/kg/dia",
    indicacao: "Candidíase oral refratária"
  },
  {
    nome: "Miconazol Gel Oral",
    categoria: "Antifúngico",
    concentracao: "2%",
    posologia_adulto: "Aplicar 4x/dia após higiene oral por 7-14 dias",
    posologia_crianca: "Aplicar 2-3x/dia por 7-14 dias",
    indicacao: "Candidíase oral"
  },

  // ANTIVIRAIS
  {
    nome: "Aciclovir",
    categoria: "Antiviral",
    concentracao: "200mg, 400mg",
    posologia_adulto: "400mg 3x/dia por 7-10 dias ou 200mg 5x/dia",
    posologia_crianca: "20mg/kg/dose 4x/dia (máx 800mg/dose)",
    indicacao: "Herpes simples, herpes zoster"
  },
  {
    nome: "Valaciclovir",
    categoria: "Antiviral",
    concentracao: "500mg",
    posologia_adulto: "500-1000mg 2x/dia por 7-10 dias",
    posologia_crianca: "Não estabelecido",
    indicacao: "Herpes simples, herpes zoster"
  },
  {
    nome: "Fanciclovir",
    categoria: "Antiviral",
    concentracao: "250mg, 500mg",
    posologia_adulto: "250mg 3x/dia por 7 dias ou 500mg 2x/dia",
    posologia_crianca: "Não estabelecido",
    indicacao: "Herpes zoster"
  },

  // CORTICOSTEROIDES
  {
    nome: "Dexametasona",
    categoria: "Corticosteroide",
    concentracao: "0.5mg, 4mg",
    posologia_adulto: "4-8mg dose única ou 0.5-4mg/dia por 3-5 dias",
    posologia_crianca: "0.1-0.3mg/kg dose única ou por 3-5 dias",
    indicacao: "Edema, inflamação pós-operatória"
  },
  {
    nome: "Prednisona",
    categoria: "Corticosteroide",
    concentracao: "5mg, 20mg",
    posologia_adulto: "20-60mg/dia por 3-7 dias com redução gradual",
    posologia_crianca: "1-2mg/kg/dia por 3-5 dias",
    indicacao: "Inflamação severa, reações alérgicas"
  },
  {
    nome: "Betametasona",
    categoria: "Corticosteroide",
    concentracao: "0.5mg, 2mg",
    posologia_adulto: "2-6mg/dia por 3-5 dias",
    posologia_crianca: "0.02-0.3mg/kg/dia",
    indicacao: "Inflamação, edema pós-operatório"
  },
  {
    nome: "Deflazacorte",
    categoria: "Corticosteroide",
    concentracao: "6mg, 30mg",
    posologia_adulto: "6-30mg/dia por 3-7 dias",
    posologia_crianca: "0.25-1.5mg/kg/dia",
    indicacao: "Inflamação pós-operatória"
  },

  // ANTIALÉRGICOS
  {
    nome: "Loratadina",
    categoria: "Anti-histamínico",
    concentracao: "10mg",
    posologia_adulto: "10mg uma vez ao dia",
    posologia_crianca: "> 2 anos: 5-10mg uma vez ao dia conforme peso",
    indicacao: "Alergias, reações alérgicas leves"
  },
  {
    nome: "Desloratadina",
    categoria: "Anti-histamínico",
    concentracao: "5mg",
    posologia_adulto: "5mg uma vez ao dia",
    posologia_crianca: "> 6 meses: 1.25-2.5mg uma vez ao dia conforme idade",
    indicacao: "Alergias, urticária"
  },
  {
    nome: "Cetirizina",
    categoria: "Anti-histamínico",
    concentracao: "10mg",
    posologia_adulto: "10mg uma vez ao dia",
    posologia_crianca: "> 2 anos: 5mg uma vez ao dia",
    indicacao: "Alergias, prurido"
  },
  {
    nome: "Hidroxizina",
    categoria: "Anti-histamínico",
    concentracao: "25mg",
    posologia_adulto: "25-50mg a cada 6-8 horas conforme necessário",
    posologia_crianca: "0.5-1mg/kg/dose a cada 6 horas",
    indicacao: "Alergias, ansiedade, prurido"
  },
  {
    nome: "Prometazina",
    categoria: "Anti-histamínico",
    concentracao: "25mg",
    posologia_adulto: "25mg a cada 6-8 horas conforme necessário",
    posologia_crianca: "> 2 anos: 0.5mg/kg/dose a cada 6 horas",
    indicacao: "Alergias, náuseas, sedação"
  },

  // ANSIOLÍTICOS / SEDATIVOS
  {
    nome: "Diazepam",
    categoria: "Ansiolítico",
    concentracao: "5mg, 10mg",
    posologia_adulto: "5-10mg 30-60min antes do procedimento",
    posologia_crianca: "0.1-0.3mg/kg 30-60min antes do procedimento",
    indicacao: "Ansiedade pré-operatória, sedação consciente"
  },
  {
    nome: "Midazolam",
    categoria: "Ansiolítico",
    concentracao: "7.5mg, 15mg",
    posologia_adulto: "7.5-15mg 30min antes do procedimento",
    posologia_crianca: "0.25-0.5mg/kg 30min antes (máx 15mg)",
    indicacao: "Sedação consciente"
  },
  {
    nome: "Alprazolam",
    categoria: "Ansiolítico",
    concentracao: "0.25mg, 0.5mg, 1mg",
    posologia_adulto: "0.25-0.5mg 30-60min antes do procedimento",
    posologia_crianca: "Não recomendado",
    indicacao: "Ansiedade"
  },

  // PROTETOR GÁSTRICO
  {
    nome: "Omeprazol",
    categoria: "Protetor gástrico",
    concentracao: "20mg, 40mg",
    posologia_adulto: "20mg em jejum 1x/dia durante uso de AINE",
    posologia_crianca: "0.7-3.3mg/kg/dia",
    indicacao: "Proteção gástrica durante uso de antiinflamatórios"
  },
  {
    nome: "Pantoprazol",
    categoria: "Protetor gástrico",
    concentracao: "20mg, 40mg",
    posologia_adulto: "40mg em jejum 1x/dia",
    posologia_crianca: "> 5 anos: 20-40mg/dia",
    indicacao: "Proteção gástrica"
  },
  {
    nome: "Esomeprazol",
    categoria: "Protetor gástrico",
    concentracao: "20mg, 40mg",
    posologia_adulto: "20-40mg em jejum 1x/dia",
    posologia_crianca: "> 1 ano: 10-20mg/dia conforme peso",
    indicacao: "Proteção gástrica"
  },
  {
    nome: "Ranitidina",
    categoria: "Protetor gástrico",
    concentracao: "150mg",
    posologia_adulto: "150mg 2x/dia",
    posologia_crianca: "2-4mg/kg 2x/dia",
    indicacao: "Proteção gástrica"
  },

  // ANTISSÉPTICOS BUCAIS
  {
    nome: "Clorexidina 0,12% (Enxaguatório)",
    categoria: "Antisséptico",
    concentracao: "0.12%",
    posologia_adulto: "15mL bochechar por 30seg, 2x/dia por 7-14 dias",
    posologia_crianca: "10mL 2x/dia por 7-14 dias (> 6 anos)",
    indicacao: "Higiene bucal, gengivite, pós-operatório"
  },
  {
    nome: "Clorexidina 2% (Gel)",
    categoria: "Antisséptico",
    concentracao: "2%",
    posologia_adulto: "Aplicar localmente 2-3x/dia",
    posologia_crianca: "Aplicar localmente 2x/dia",
    indicacao: "Gengivite localizada, pós-cirúrgico"
  },
  {
    nome: "Periogard (Clorexidina 0,12%)",
    categoria: "Antisséptico",
    concentracao: "0.12%",
    posologia_adulto: "15mL bochechar 2x/dia após escovação",
    posologia_crianca: "10mL 2x/dia (> 6 anos)",
    indicacao: "Controle de placa, gengivite"
  },

  // VITAMINAS E SUPLEMENTOS
  {
    nome: "Vitamina C",
    categoria: "Vitamina",
    concentracao: "500mg, 1000mg",
    posologia_adulto: "500-1000mg/dia por 7-14 dias",
    posologia_crianca: "50-100mg/dia",
    indicacao: "Cicatrização, gengivite"
  },
  {
    nome: "Vitamina K",
    categoria: "Vitamina",
    concentracao: "10mg",
    posologia_adulto: "10mg/dia antes e após cirurgia",
    posologia_crianca: "Conforme orientação médica",
    indicacao: "Hemostasia, anticoagulados"
  },
  {
    nome: "Complexo B",
    categoria: "Vitamina",
    concentracao: "Variado",
    posologia_adulto: "1 comprimido/dia",
    posologia_crianca: "Conforme orientação médica",
    indicacao: "Neuralgia, parestesia, glossite"
  },

  // HEMOSTÁTICOS / COAGULANTES
  {
    nome: "Ácido Tranexâmico",
    categoria: "Hemostático",
    concentracao: "250mg, 500mg",
    posologia_adulto: "500mg a cada 8 horas por 3-5 dias",
    posologia_crianca: "10-25mg/kg a cada 8 horas",
    indicacao: "Prevenção de sangramento em pacientes de risco"
  },
  {
    nome: "Etamsilato",
    categoria: "Hemostático",
    concentracao: "250mg",
    posologia_adulto: "250-500mg a cada 6 horas por 3-5 dias",
    posologia_crianca: "10-15mg/kg a cada 6 horas",
    indicacao: "Hemostasia pós-cirúrgica"
  },

  // RELAXANTES MUSCULARES
  {
    nome: "Ciclobenzaprina",
    categoria: "Relaxante muscular",
    concentracao: "5mg, 10mg",
    posologia_adulto: "5-10mg à noite por 5-10 dias",
    posologia_crianca: "Não recomendado < 15 anos",
    indicacao: "Disfunção temporomandibular, espasmo muscular"
  },
  {
    nome: "Carisoprodol",
    categoria: "Relaxante muscular",
    concentracao: "125mg, 250mg",
    posologia_adulto: "250-350mg 3x/dia",
    posologia_crianca: "Não recomendado < 16 anos",
    indicacao: "Espasmo muscular, DTM"
  },

  // ENZIMAS
  {
    nome: "Bromelina",
    categoria: "Enzima proteolítica",
    concentracao: "200mg",
    posologia_adulto: "200mg 3x/dia por 3-5 dias longe das refeições",
    posologia_crianca: "Não estabelecido",
    indicacao: "Edema, inflamação pós-operatória"
  },
  {
    nome: "Serratiopeptidase",
    categoria: "Enzima proteolítica",
    concentracao: "10mg",
    posologia_adulto: "10mg 2-3x/dia por 3-5 dias longe das refeições",
    posologia_crianca: "Não estabelecido",
    indicacao: "Edema, inflamação"
  },

  // ANESTÉSICOS TÓPICOS
  {
    nome: "Benzocaína Gel 20%",
    categoria: "Anestésico tópico",
    concentracao: "20%",
    posologia_adulto: "Aplicar pequena quantidade no local 3-4x/dia",
    posologia_crianca: "Aplicar com moderação 2-3x/dia",
    indicacao: "Dor em mucosa oral, erupção dentária"
  },
  {
    nome: "Lidocaína Gel 2%",
    categoria: "Anestésico tópico",
    concentracao: "2%",
    posologia_adulto: "Aplicar no local antes de procedimentos",
    posologia_crianca: "Aplicar com moderação",
    indicacao: "Anestesia tópica antes de injeção"
  },

  // ANTIEMÉTICOS
  {
    nome: "Ondansetrona",
    categoria: "Antiemético",
    concentracao: "4mg, 8mg",
    posologia_adulto: "4-8mg 30min antes do procedimento ou a cada 8h",
    posologia_crianca: "0.1-0.15mg/kg/dose (máx 4mg)",
    indicacao: "Náusea, vômito pós-operatório"
  },
  {
    nome: "Metoclopramida",
    categoria: "Antiemético",
    concentracao: "10mg",
    posologia_adulto: "10mg 3x/dia antes das refeições",
    posologia_crianca: "0.1-0.2mg/kg/dose 3x/dia",
    indicacao: "Náusea, vômito"
  },
  {
    nome: "Bromoprida",
    categoria: "Antiemético",
    concentracao: "10mg",
    posologia_adulto: "10mg 3x/dia",
    posologia_crianca: "0.5-1mg/kg/dia dividido em 3 doses",
    indicacao: "Náusea, vômito, dispepsia"
  },

  // OUTROS
  {
    nome: "Tramadol",
    categoria: "Analgésico opioide",
    concentracao: "50mg, 100mg",
    posologia_adulto: "50-100mg a cada 6-8 horas conforme necessário (máx 400mg/dia)",
    posologia_crianca: "Não recomendado < 12 anos; > 12 anos: 1-2mg/kg/dose",
    indicacao: "Dor moderada a severa"
  },
  {
    nome: "Codeína + Paracetamol",
    categoria: "Analgésico opioide",
    concentracao: "30mg + 500mg",
    posologia_adulto: "1-2 comprimidos a cada 6 horas conforme necessário",
    posologia_crianca: "Não recomendado < 12 anos",
    indicacao: "Dor moderada"
  },
  {
    nome: "Colchicina",
    categoria: "Anti-gota",
    concentracao: "0.5mg",
    posologia_adulto: "0.5-1mg 2x/dia por 3-5 dias",
    posologia_crianca: "Não estabelecido",
    indicacao: "Artrite gotosa aguda na ATM"
  },
  {
    nome: "Alopurinol",
    categoria: "Anti-gota",
    concentracao: "100mg, 300mg",
    posologia_adulto: "100-300mg/dia",
    posologia_crianca: "Não estabelecido",
    indicacao: "Profilaxia de gota"
  },
];

// Categorias únicas para filtro
export const categorias = Array.from(new Set(medicamentos.map(m => m.categoria)));