-- ================================================
-- FASE 1: REESTRUTURACAO DO CADASTRO DE DESPESAS
-- 3 Níveis: Tipo Macro -> Grupo -> Item
-- ================================================

-- Tabela Nível 1: Tipos Macro de Despesa
CREATE TABLE IF NOT EXISTS public.expense_macro_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  ordem INT DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id, codigo)
);

-- Tabela Nível 2: Grupos de Despesa (Subcategorias)
CREATE TABLE IF NOT EXISTS public.expense_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE,
  macro_type_id UUID REFERENCES public.expense_macro_types(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INT DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Nível 3: Itens de Despesa (Detalhado)
CREATE TABLE IF NOT EXISTS public.expense_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.expense_groups(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  e_investimento BOOLEAN DEFAULT FALSE,
  centro_custo TEXT,
  fornecedor_padrao_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  forma_pagamento_padrao TEXT,
  recorrente BOOLEAN DEFAULT FALSE,
  frequencia TEXT,
  dia_vencimento INT,
  valor_padrao NUMERIC(15,2),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Recorrências Financeiras
CREATE TABLE IF NOT EXISTS public.financial_recurrences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  expense_item_id UUID REFERENCES public.expense_items(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pagar', 'receber')),
  descricao TEXT NOT NULL,
  frequencia TEXT NOT NULL CHECK (frequencia IN ('diaria', 'semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual')),
  valor NUMERIC(15,2) NOT NULL,
  dia_vencimento INT,
  dia_semana INT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  conta_bancaria_id UUID REFERENCES public.caixas(id) ON DELETE SET NULL,
  centro_custo TEXT,
  proxima_geracao DATE,
  ultima_geracao DATE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar novos campos em payable_titles
ALTER TABLE public.payable_titles 
ADD COLUMN IF NOT EXISTS expense_item_id UUID REFERENCES public.expense_items(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS conta_bancaria_id UUID REFERENCES public.caixas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS competencia DATE,
ADD COLUMN IF NOT EXISTS parcelado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parcela_numero INT,
ADD COLUMN IF NOT EXISTS total_parcelas INT,
ADD COLUMN IF NOT EXISTS centro_custo TEXT,
ADD COLUMN IF NOT EXISTS recurrence_id UUID REFERENCES public.financial_recurrences(id) ON DELETE SET NULL;

-- Adicionar novos campos em receivable_titles
ALTER TABLE public.receivable_titles
ADD COLUMN IF NOT EXISTS competencia DATE,
ADD COLUMN IF NOT EXISTS taxa_adquirente NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS data_repasse DATE,
ADD COLUMN IF NOT EXISTS antecipado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS valor_liquido NUMERIC(15,2);

-- Enable RLS
ALTER TABLE public.expense_macro_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_recurrences ENABLE ROW LEVEL SECURITY;

-- RLS Policies para expense_macro_types
CREATE POLICY "Users can view expense_macro_types of their clinic"
ON public.expense_macro_types FOR SELECT
USING (
  clinic_id = get_user_clinic_id(auth.uid()) 
  OR clinic_id IS NULL
  OR is_super_admin(auth.uid())
);

CREATE POLICY "Admins can manage expense_macro_types"
ON public.expense_macro_types FOR ALL
USING (
  (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'::perfil_usuario))
  OR is_super_admin(auth.uid())
)
WITH CHECK (
  (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'::perfil_usuario))
  OR is_super_admin(auth.uid())
);

-- RLS Policies para expense_groups
CREATE POLICY "Users can view expense_groups of their clinic"
ON public.expense_groups FOR SELECT
USING (
  clinic_id = get_user_clinic_id(auth.uid()) 
  OR is_super_admin(auth.uid())
);

CREATE POLICY "Admins can manage expense_groups"
ON public.expense_groups FOR ALL
USING (
  (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'::perfil_usuario))
  OR is_super_admin(auth.uid())
)
WITH CHECK (
  (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'::perfil_usuario))
  OR is_super_admin(auth.uid())
);

-- RLS Policies para expense_items
CREATE POLICY "Users can view expense_items of their clinic"
ON public.expense_items FOR SELECT
USING (
  clinic_id = get_user_clinic_id(auth.uid()) 
  OR is_super_admin(auth.uid())
);

CREATE POLICY "Admins can manage expense_items"
ON public.expense_items FOR ALL
USING (
  (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'::perfil_usuario))
  OR is_super_admin(auth.uid())
)
WITH CHECK (
  (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'::perfil_usuario))
  OR is_super_admin(auth.uid())
);

-- RLS Policies para financial_recurrences
CREATE POLICY "Users can view financial_recurrences of their clinic"
ON public.financial_recurrences FOR SELECT
USING (
  clinic_id = get_user_clinic_id(auth.uid()) 
  OR is_super_admin(auth.uid())
);

CREATE POLICY "Admins can manage financial_recurrences"
ON public.financial_recurrences FOR ALL
USING (
  (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'::perfil_usuario))
  OR is_super_admin(auth.uid())
)
WITH CHECK (
  (clinic_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'::perfil_usuario))
  OR is_super_admin(auth.uid())
);

-- Triggers para updated_at
CREATE TRIGGER update_expense_macro_types_updated_at
BEFORE UPDATE ON public.expense_macro_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_groups_updated_at
BEFORE UPDATE ON public.expense_groups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_items_updated_at
BEFORE UPDATE ON public.expense_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_recurrences_updated_at
BEFORE UPDATE ON public.financial_recurrences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();