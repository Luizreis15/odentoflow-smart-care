-- Enums para tipos de remuneração e bases de cálculo
CREATE TYPE tipo_remuneracao AS ENUM ('fixo_mensal', 'repasse_producao', 'hibrido');
CREATE TYPE base_calculo_repasse AS ENUM ('valor_bruto', 'valor_liquido', 'valor_recebido');
CREATE TYPE modelo_repasse AS ENUM ('percentual_unico', 'por_procedimento', 'por_convenio', 'por_origem');
CREATE TYPE status_comissao AS ENUM ('provisionado', 'aprovado', 'pago', 'cancelado');
CREATE TYPE responsavel_tributario AS ENUM ('profissional', 'clinica');

-- Tabela de configuração de remuneração do profissional
CREATE TABLE profissional_remuneracao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  tipo_remuneracao tipo_remuneracao NOT NULL,
  
  -- Campos para fixo mensal
  valor_fixo_mensal NUMERIC(10,2),
  dia_pagamento_fixo INTEGER CHECK (dia_pagamento_fixo >= 1 AND dia_pagamento_fixo <= 31),
  
  -- Campos para repasse por produção
  modelo_repasse modelo_repasse,
  percentual_unico NUMERIC(5,2),
  base_calculo_padrao base_calculo_repasse,
  minimo_garantido_mensal NUMERIC(10,2),
  teto_repasse_mensal NUMERIC(10,2),
  adiantamento_permitido BOOLEAN DEFAULT false,
  limite_adiantamento NUMERIC(10,2),
  
  -- Dados bancários e fiscais
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta TEXT,
  chave_pix TEXT,
  responsavel_tributario responsavel_tributario DEFAULT 'clinica',
  reter_inss BOOLEAN DEFAULT false,
  percentual_inss NUMERIC(5,2),
  reter_iss BOOLEAN DEFAULT false,
  percentual_iss NUMERIC(5,2),
  reter_irrf BOOLEAN DEFAULT false,
  percentual_irrf NUMERIC(5,2),
  gerar_rpa BOOLEAN DEFAULT true,
  
  -- Rateio por centro de custo (JSON com array de {centro_custo_id, percentual})
  rateio_centros_custo JSONB,
  
  ativo BOOLEAN DEFAULT true,
  vigencia_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  vigencia_fim DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de regras específicas de repasse
CREATE TABLE repasse_regras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remuneracao_id UUID NOT NULL REFERENCES profissional_remuneracao(id) ON DELETE CASCADE,
  
  -- Filtros da regra
  procedimento_codigo TEXT,
  procedimento_nome TEXT,
  convenio TEXT,
  origem TEXT,
  
  -- Configuração do repasse
  percentual NUMERIC(5,2) NOT NULL,
  base_calculo base_calculo_repasse NOT NULL,
  prioridade INTEGER DEFAULT 0,
  
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de eventos de produção
CREATE TABLE producao_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinicas(id),
  profissional_id UUID NOT NULL REFERENCES profissionais(id),
  paciente_id UUID NOT NULL REFERENCES patients(id),
  
  -- Dados do procedimento
  data_execucao DATE NOT NULL,
  data_recebimento DATE,
  procedimento_codigo TEXT,
  procedimento_nome TEXT NOT NULL,
  convenio TEXT,
  origem TEXT,
  
  -- Valores
  valor_bruto NUMERIC(10,2) NOT NULL,
  taxas_descontos NUMERIC(10,2) DEFAULT 0,
  valor_liquido NUMERIC(10,2) NOT NULL,
  valor_recebido NUMERIC(10,2),
  
  -- Status e pagamento
  status_recebimento TEXT DEFAULT 'recebido',
  forma_pagamento TEXT,
  
  -- Vínculo
  orcamento_id UUID,
  budget_item_id UUID REFERENCES budget_items(id),
  
  -- Regra de repasse aplicada (congelada)
  regra_percentual NUMERIC(5,2),
  regra_base_calculo base_calculo_repasse,
  valor_repasse_calculado NUMERIC(10,2),
  
  -- Coautoria (JSON com array de {profissional_id, percentual})
  coautores JSONB,
  
  processado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de provisões de comissões
CREATE TABLE comissoes_provisoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinicas(id),
  profissional_id UUID NOT NULL REFERENCES profissionais(id),
  competencia DATE NOT NULL, -- primeiro dia do mês
  
  -- Valores
  valor_producao_bruta NUMERIC(10,2) DEFAULT 0,
  valor_producao_liquida NUMERIC(10,2) DEFAULT 0,
  valor_producao_recebida NUMERIC(10,2) DEFAULT 0,
  valor_provisionado NUMERIC(10,2) NOT NULL,
  valor_adiantamentos NUMERIC(10,2) DEFAULT 0,
  valor_ajustes NUMERIC(10,2) DEFAULT 0,
  valor_minimo_garantido NUMERIC(10,2),
  valor_teto_aplicado NUMERIC(10,2),
  valor_devido NUMERIC(10,2) NOT NULL,
  
  -- Retenções (aplicadas no pagamento)
  valor_inss NUMERIC(10,2) DEFAULT 0,
  valor_iss NUMERIC(10,2) DEFAULT 0,
  valor_irrf NUMERIC(10,2) DEFAULT 0,
  valor_liquido_pagar NUMERIC(10,2),
  
  status status_comissao DEFAULT 'provisionado',
  
  -- Controle
  fechado_por UUID REFERENCES profiles(id),
  fechado_em TIMESTAMP WITH TIME ZONE,
  aprovado_por UUID REFERENCES profiles(id),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  
  -- Vínculo com pagamento
  conta_pagar_id UUID, -- referência ao sistema de contas a pagar
  financial_transaction_id UUID REFERENCES financial_transactions(id),
  
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(profissional_id, competencia)
);

-- Tabela de adiantamentos
CREATE TABLE comissoes_adiantamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinicas(id),
  profissional_id UUID NOT NULL REFERENCES profissionais(id),
  
  valor NUMERIC(10,2) NOT NULL,
  data_adiantamento DATE NOT NULL DEFAULT CURRENT_DATE,
  forma_pagamento TEXT,
  
  -- Abatimento
  valor_abatido NUMERIC(10,2) DEFAULT 0,
  saldo NUMERIC(10,2) NOT NULL,
  quitado BOOLEAN DEFAULT false,
  
  -- Vínculos de abatimento (JSON com array de {provisao_id, valor_abatido})
  abatimentos JSONB,
  
  concedido_por UUID NOT NULL REFERENCES profiles(id),
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de ajustes manuais
CREATE TABLE comissoes_ajustes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provisao_id UUID NOT NULL REFERENCES comissoes_provisoes(id) ON DELETE CASCADE,
  
  tipo_ajuste TEXT NOT NULL, -- 'acrescimo', 'desconto', 'correcao'
  valor NUMERIC(10,2) NOT NULL,
  justificativa TEXT NOT NULL,
  
  criado_por UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_profissional_remuneracao_profissional ON profissional_remuneracao(profissional_id);
CREATE INDEX idx_profissional_remuneracao_vigencia ON profissional_remuneracao(vigencia_inicio, vigencia_fim);
CREATE INDEX idx_repasse_regras_remuneracao ON repasse_regras(remuneracao_id);
CREATE INDEX idx_producao_eventos_profissional ON producao_eventos(profissional_id);
CREATE INDEX idx_producao_eventos_datas ON producao_eventos(data_execucao, data_recebimento);
CREATE INDEX idx_producao_eventos_clinic ON producao_eventos(clinic_id);
CREATE INDEX idx_comissoes_provisoes_profissional ON comissoes_provisoes(profissional_id);
CREATE INDEX idx_comissoes_provisoes_competencia ON comissoes_provisoes(competencia);
CREATE INDEX idx_comissoes_provisoes_status ON comissoes_provisoes(status);
CREATE INDEX idx_comissoes_adiantamentos_profissional ON comissoes_adiantamentos(profissional_id);

-- RLS Policies
ALTER TABLE profissional_remuneracao ENABLE ROW LEVEL SECURITY;
ALTER TABLE repasse_regras ENABLE ROW LEVEL SECURITY;
ALTER TABLE producao_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissoes_provisoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissoes_adiantamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissoes_ajustes ENABLE ROW LEVEL SECURITY;

-- Policies para profissional_remuneracao
CREATE POLICY "Users can view remuneracao from their clinic"
  ON profissional_remuneracao FOR SELECT
  USING (profissional_id IN (
    SELECT id FROM profissionais WHERE clinica_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Admins can manage remuneracao"
  ON profissional_remuneracao FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::perfil_usuario) AND
    profissional_id IN (
      SELECT id FROM profissionais WHERE clinica_id = get_user_clinic_id(auth.uid())
    )
  );

-- Policies para repasse_regras
CREATE POLICY "Users can view repasse rules from their clinic"
  ON repasse_regras FOR SELECT
  USING (remuneracao_id IN (
    SELECT pr.id FROM profissional_remuneracao pr
    JOIN profissionais p ON pr.profissional_id = p.id
    WHERE p.clinica_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Admins can manage repasse rules"
  ON repasse_regras FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::perfil_usuario) AND
    remuneracao_id IN (
      SELECT pr.id FROM profissional_remuneracao pr
      JOIN profissionais p ON pr.profissional_id = p.id
      WHERE p.clinica_id = get_user_clinic_id(auth.uid())
    )
  );

-- Policies para producao_eventos
CREATE POLICY "Users can view producao from their clinic"
  ON producao_eventos FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can insert producao events"
  ON producao_eventos FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage producao events"
  ON producao_eventos FOR ALL
  USING (
    clinic_id = get_user_clinic_id(auth.uid()) AND
    has_role(auth.uid(), 'admin'::perfil_usuario)
  );

-- Policies para comissoes_provisoes
CREATE POLICY "Users can view provisoes from their clinic"
  ON comissoes_provisoes FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage provisoes"
  ON comissoes_provisoes FOR ALL
  USING (
    clinic_id = get_user_clinic_id(auth.uid()) AND
    has_role(auth.uid(), 'admin'::perfil_usuario)
  );

-- Policies para comissoes_adiantamentos
CREATE POLICY "Users can view adiantamentos from their clinic"
  ON comissoes_adiantamentos FOR SELECT
  USING (clinic_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage adiantamentos"
  ON comissoes_adiantamentos FOR ALL
  USING (
    clinic_id = get_user_clinic_id(auth.uid()) AND
    has_role(auth.uid(), 'admin'::perfil_usuario)
  );

-- Policies para comissoes_ajustes
CREATE POLICY "Users can view ajustes from their clinic"
  ON comissoes_ajustes FOR SELECT
  USING (provisao_id IN (
    SELECT id FROM comissoes_provisoes WHERE clinic_id = get_user_clinic_id(auth.uid())
  ));

CREATE POLICY "Admins can create ajustes"
  ON comissoes_ajustes FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::perfil_usuario) AND
    provisao_id IN (
      SELECT id FROM comissoes_provisoes WHERE clinic_id = get_user_clinic_id(auth.uid())
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_profissional_remuneracao_updated_at
  BEFORE UPDATE ON profissional_remuneracao
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repasse_regras_updated_at
  BEFORE UPDATE ON repasse_regras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_producao_eventos_updated_at
  BEFORE UPDATE ON producao_eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comissoes_provisoes_updated_at
  BEFORE UPDATE ON comissoes_provisoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comissoes_adiantamentos_updated_at
  BEFORE UPDATE ON comissoes_adiantamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();