-- Create ENUM types for stock module
CREATE TYPE metodo_custeio AS ENUM ('media_ponderada', 'fifo');
CREATE TYPE tipo_movimentacao_estoque AS ENUM ('entrada', 'saida', 'transferencia', 'ajuste', 'devolucao');
CREATE TYPE status_nfe AS ENUM ('pendente', 'conferida', 'lancada', 'cancelada');

-- Create stock_locations table
CREATE TABLE public.stock_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suppliers table (fornecedores)
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  cnpj TEXT,
  ie TEXT,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  contato_nome TEXT,
  contato_email TEXT,
  contato_telefone TEXT,
  contato_whatsapp TEXT,
  endereco JSONB,
  condicoes_pagamento TEXT,
  lead_time_medio_dias INTEGER,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  codigo_interno TEXT NOT NULL,
  sku TEXT,
  ean TEXT,
  nome TEXT NOT NULL,
  categoria TEXT,
  subcategoria TEXT,
  marca TEXT,
  foto_url TEXT,
  unidade TEXT NOT NULL DEFAULT 'un',
  fator_conversao NUMERIC DEFAULT 1,
  controle_lote BOOLEAN NOT NULL DEFAULT false,
  controle_validade BOOLEAN NOT NULL DEFAULT false,
  ncm TEXT,
  cfop_padrao TEXT,
  local_padrao_id UUID REFERENCES public.stock_locations(id),
  estoque_minimo NUMERIC DEFAULT 0,
  estoque_maximo NUMERIC,
  lead_time_dias INTEGER,
  metodo_custeio metodo_custeio NOT NULL DEFAULT 'media_ponderada',
  preco_venda NUMERIC,
  margem_alvo NUMERIC,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinica_id, codigo_interno)
);

-- Create product_suppliers table
CREATE TABLE public.product_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  preco_ultimo NUMERIC,
  preco_melhor NUMERIC,
  lead_time_dias INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, supplier_id)
);

-- Create batches table
CREATE TABLE public.batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  data_validade DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, codigo)
);

-- Create stocks table (posição de estoque)
CREATE TABLE public.stocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.stock_locations(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id),
  quantidade NUMERIC NOT NULL DEFAULT 0,
  custo_medio NUMERIC NOT NULL DEFAULT 0,
  fifo_layers JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, location_id, batch_id)
);

-- Create purchase_invoices table (NFes)
CREATE TABLE public.purchase_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id),
  numero TEXT NOT NULL,
  serie TEXT,
  chave_acesso TEXT,
  data_emissao DATE NOT NULL,
  valor_total NUMERIC NOT NULL,
  valor_frete NUMERIC DEFAULT 0,
  valor_desconto NUMERIC DEFAULT 0,
  valor_seguro NUMERIC DEFAULT 0,
  status status_nfe NOT NULL DEFAULT 'pendente',
  xml_file_path TEXT,
  observacoes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_items table
CREATE TABLE public.purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.purchase_invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  descricao_nfe TEXT NOT NULL,
  quantidade NUMERIC NOT NULL,
  custo_unitario NUMERIC NOT NULL,
  custo_total NUMERIC NOT NULL,
  frete_rateado NUMERIC DEFAULT 0,
  desconto_rateado NUMERIC DEFAULT 0,
  seguro_rateado NUMERIC DEFAULT 0,
  batch_id UUID REFERENCES public.batches(id),
  data_validade DATE,
  location_id UUID REFERENCES public.stock_locations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_moves table (movimentações)
CREATE TABLE public.stock_moves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  tipo tipo_movimentacao_estoque NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantidade NUMERIC NOT NULL,
  custo_unitario NUMERIC NOT NULL,
  custo_total NUMERIC NOT NULL,
  location_from_id UUID REFERENCES public.stock_locations(id),
  location_to_id UUID REFERENCES public.stock_locations(id),
  batch_id UUID REFERENCES public.batches(id),
  doc_tipo TEXT,
  doc_id UUID,
  observacoes TEXT,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_kits table (kits de procedimentos)
CREATE TABLE public.stock_kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  codigo_procedimento TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinica_id, codigo_procedimento)
);

-- Create stock_kit_items table
CREATE TABLE public.stock_kit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kit_id UUID NOT NULL REFERENCES public.stock_kits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantidade NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(kit_id, product_id)
);

-- Create indexes
CREATE INDEX idx_products_clinica ON public.products(clinica_id);
CREATE INDEX idx_products_ean ON public.products(ean);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_stocks_product ON public.stocks(product_id);
CREATE INDEX idx_stocks_location ON public.stocks(location_id);
CREATE INDEX idx_stock_moves_product ON public.stock_moves(product_id);
CREATE INDEX idx_stock_moves_clinica ON public.stock_moves(clinica_id);
CREATE INDEX idx_stock_moves_created ON public.stock_moves(created_at);
CREATE INDEX idx_batches_validade ON public.batches(data_validade);

-- Enable RLS
ALTER TABLE public.stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_kit_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stock_locations
CREATE POLICY "Users can view locations from their clinic"
  ON public.stock_locations FOR SELECT
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage locations"
  ON public.stock_locations FOR ALL
  USING (clinica_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- RLS Policies for suppliers
CREATE POLICY "Users can view suppliers from their clinic"
  ON public.suppliers FOR SELECT
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage suppliers"
  ON public.suppliers FOR ALL
  USING (clinica_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- RLS Policies for products
CREATE POLICY "Users can view products from their clinic"
  ON public.products FOR SELECT
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (clinica_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- RLS Policies for product_suppliers
CREATE POLICY "Users can view product suppliers"
  ON public.product_suppliers FOR SELECT
  USING (product_id IN (SELECT id FROM public.products WHERE clinica_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Admins can manage product suppliers"
  ON public.product_suppliers FOR ALL
  USING (product_id IN (SELECT id FROM public.products WHERE clinica_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin')));

-- RLS Policies for batches
CREATE POLICY "Users can view batches"
  ON public.batches FOR SELECT
  USING (product_id IN (SELECT id FROM public.products WHERE clinica_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can create batches"
  ON public.batches FOR INSERT
  WITH CHECK (product_id IN (SELECT id FROM public.products WHERE clinica_id = get_user_clinic_id(auth.uid())));

-- RLS Policies for stocks
CREATE POLICY "Users can view stocks from their clinic"
  ON public.stocks FOR SELECT
  USING (product_id IN (SELECT id FROM public.products WHERE clinica_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can manage stocks"
  ON public.stocks FOR ALL
  USING (product_id IN (SELECT id FROM public.products WHERE clinica_id = get_user_clinic_id(auth.uid())));

-- RLS Policies for purchase_invoices
CREATE POLICY "Users can view invoices from their clinic"
  ON public.purchase_invoices FOR SELECT
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create invoices"
  ON public.purchase_invoices FOR INSERT
  WITH CHECK (clinica_id = get_user_clinic_id(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Admins can manage invoices"
  ON public.purchase_invoices FOR ALL
  USING (clinica_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- RLS Policies for purchase_items
CREATE POLICY "Users can view purchase items"
  ON public.purchase_items FOR SELECT
  USING (invoice_id IN (SELECT id FROM public.purchase_invoices WHERE clinica_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can create purchase items"
  ON public.purchase_items FOR INSERT
  WITH CHECK (invoice_id IN (SELECT id FROM public.purchase_invoices WHERE clinica_id = get_user_clinic_id(auth.uid())));

-- RLS Policies for stock_moves
CREATE POLICY "Users can view moves from their clinic"
  ON public.stock_moves FOR SELECT
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Users can create moves"
  ON public.stock_moves FOR INSERT
  WITH CHECK (clinica_id = get_user_clinic_id(auth.uid()) AND usuario_id = auth.uid());

-- RLS Policies for stock_kits
CREATE POLICY "Users can view kits from their clinic"
  ON public.stock_kits FOR SELECT
  USING (clinica_id = get_user_clinic_id(auth.uid()));

CREATE POLICY "Admins can manage kits"
  ON public.stock_kits FOR ALL
  USING (clinica_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- RLS Policies for stock_kit_items
CREATE POLICY "Users can view kit items"
  ON public.stock_kit_items FOR SELECT
  USING (kit_id IN (SELECT id FROM public.stock_kits WHERE clinica_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Admins can manage kit items"
  ON public.stock_kit_items FOR ALL
  USING (kit_id IN (SELECT id FROM public.stock_kits WHERE clinica_id = get_user_clinic_id(auth.uid()) AND has_role(auth.uid(), 'admin')));

-- Add triggers for updated_at
CREATE TRIGGER update_stock_locations_updated_at BEFORE UPDATE ON public.stock_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_suppliers_updated_at BEFORE UPDATE ON public.product_suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON public.stocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_invoices_updated_at BEFORE UPDATE ON public.purchase_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_kits_updated_at BEFORE UPDATE ON public.stock_kits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();