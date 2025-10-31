export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anamnese_modelos: {
        Row: {
          ativo: boolean
          clinica_id: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          clinica_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          clinica_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamnese_modelos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnese_perguntas: {
        Row: {
          condicao_resposta: string | null
          created_at: string
          id: string
          modelo_id: string
          obrigatoria: boolean
          ordem: number
          pergunta_pai_id: string | null
          texto: string
          tipo_resposta: string
          updated_at: string
        }
        Insert: {
          condicao_resposta?: string | null
          created_at?: string
          id?: string
          modelo_id: string
          obrigatoria?: boolean
          ordem: number
          pergunta_pai_id?: string | null
          texto: string
          tipo_resposta?: string
          updated_at?: string
        }
        Update: {
          condicao_resposta?: string | null
          created_at?: string
          id?: string
          modelo_id?: string
          obrigatoria?: boolean
          ordem?: number
          pergunta_pai_id?: string | null
          texto?: string
          tipo_resposta?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamnese_perguntas_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "anamnese_modelos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnese_perguntas_pergunta_pai_id_fkey"
            columns: ["pergunta_pai_id"]
            isOneToOne: false
            referencedRelation: "anamnese_perguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnese_respostas: {
        Row: {
          anamnese_id: string
          created_at: string
          id: string
          observacoes: string | null
          pergunta_id: string
          resposta: string | null
          updated_at: string
        }
        Insert: {
          anamnese_id: string
          created_at?: string
          id?: string
          observacoes?: string | null
          pergunta_id: string
          resposta?: string | null
          updated_at?: string
        }
        Update: {
          anamnese_id?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          pergunta_id?: string
          resposta?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamnese_respostas_anamnese_id_fkey"
            columns: ["anamnese_id"]
            isOneToOne: false
            referencedRelation: "anamneses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnese_respostas_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "anamnese_perguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      anamneses: {
        Row: {
          alerta_clinico: boolean
          alerta_descricao: string | null
          assinatura_data: string | null
          assinatura_hash: string | null
          created_at: string
          data: string
          finalizada_em: string | null
          id: string
          modelo_id: string
          paciente_id: string
          profissional_id: string
          status: string
          updated_at: string
        }
        Insert: {
          alerta_clinico?: boolean
          alerta_descricao?: string | null
          assinatura_data?: string | null
          assinatura_hash?: string | null
          created_at?: string
          data?: string
          finalizada_em?: string | null
          id?: string
          modelo_id: string
          paciente_id: string
          profissional_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          alerta_clinico?: boolean
          alerta_descricao?: string | null
          assinatura_data?: string | null
          assinatura_hash?: string | null
          created_at?: string
          data?: string
          finalizada_em?: string | null
          id?: string
          modelo_id?: string
          paciente_id?: string
          profissional_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "anamnese_modelos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string | null
          dentist_id: string
          description: string | null
          duration_minutes: number | null
          id: string
          patient_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          created_at?: string | null
          dentist_id: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          patient_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          created_at?: string | null
          dentist_id?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          patient_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          acao: string
          created_at: string | null
          detalhes: Json | null
          dispositivo: string | null
          id: string
          ip_address: string | null
          modulo: string | null
          resultado: string | null
          user_id: string
        }
        Insert: {
          acao: string
          created_at?: string | null
          detalhes?: Json | null
          dispositivo?: string | null
          id?: string
          ip_address?: string | null
          modulo?: string | null
          resultado?: string | null
          user_id: string
        }
        Update: {
          acao?: string
          created_at?: string | null
          detalhes?: Json | null
          dispositivo?: string | null
          id?: string
          ip_address?: string | null
          modulo?: string | null
          resultado?: string | null
          user_id?: string
        }
        Relationships: []
      }
      automated_messages: {
        Row: {
          channel: string
          clinic_id: string
          content: string
          created_at: string | null
          id: string
          status: string | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          channel: string
          clinic_id: string
          content: string
          created_at?: string | null
          id?: string
          status?: string | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          channel?: string
          clinic_id?: string
          content?: string
          created_at?: string | null
          id?: string
          status?: string | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_messages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          codigo: string
          created_at: string
          data_validade: string | null
          id: string
          product_id: string
        }
        Insert: {
          codigo: string
          created_at?: string
          data_validade?: string | null
          id?: string
          product_id: string
        }
        Update: {
          codigo?: string
          created_at?: string
          data_validade?: string | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          budget_id: string
          created_at: string | null
          discount: number | null
          id: string
          notes: string | null
          procedure_code: string | null
          procedure_name: string
          quantity: number
          status: string | null
          tooth_number: string | null
          tooth_region: string | null
          total_price: number
          treatment_status: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          budget_id: string
          created_at?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          procedure_code?: string | null
          procedure_name: string
          quantity?: number
          status?: string | null
          tooth_number?: string | null
          tooth_region?: string | null
          total_price: number
          treatment_status?: string | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          budget_id?: string
          created_at?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          procedure_code?: string | null
          procedure_name?: string
          quantity?: number
          status?: string | null
          tooth_number?: string | null
          tooth_region?: string | null
          total_price?: number
          treatment_status?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          approved_at: string | null
          clinic_id: string
          converted_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          discount_value: number | null
          final_value: number | null
          id: string
          notes: string | null
          patient_id: string
          status: string
          title: string
          total_value: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          clinic_id: string
          converted_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          discount_value?: number | null
          final_value?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string
          title: string
          total_value?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          clinic_id?: string
          converted_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          discount_value?: number | null
          final_value?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string
          title?: string
          total_value?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      cadeiras: {
        Row: {
          ativo: boolean | null
          clinica_id: string
          created_at: string | null
          id: string
          localizacao: string | null
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          clinica_id: string
          created_at?: string | null
          id?: string
          localizacao?: string | null
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          clinica_id?: string
          created_at?: string | null
          id?: string
          localizacao?: string | null
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadeiras_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      caixas: {
        Row: {
          ativo: boolean | null
          clinica_id: string
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          saldo_inicial: number | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          clinica_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          saldo_inicial?: number | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          clinica_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          saldo_inicial?: number | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caixas_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_procedimentos: {
        Row: {
          ativo: boolean | null
          clinica_id: string
          cor: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          clinica_id: string
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          clinica_id?: string
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_procedimentos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      clinicas: {
        Row: {
          address: Json | null
          cnpj: string | null
          created_at: string | null
          current_period_end: string | null
          id: string
          nome: string
          onboarding_status: string | null
          owner_user_id: string | null
          plano: Database["public"]["Enums"]["plano_tipo"] | null
          status_assinatura:
            | Database["public"]["Enums"]["status_assinatura"]
            | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          telefone: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          cnpj?: string | null
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          nome: string
          onboarding_status?: string | null
          owner_user_id?: string | null
          plano?: Database["public"]["Enums"]["plano_tipo"] | null
          status_assinatura?:
            | Database["public"]["Enums"]["status_assinatura"]
            | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          cnpj?: string | null
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          nome?: string
          onboarding_status?: string | null
          owner_user_id?: string | null
          plano?: Database["public"]["Enums"]["plano_tipo"] | null
          status_assinatura?:
            | Database["public"]["Enums"]["status_assinatura"]
            | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comissoes_adiantamentos: {
        Row: {
          abatimentos: Json | null
          clinic_id: string
          concedido_por: string
          created_at: string | null
          data_adiantamento: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          profissional_id: string
          quitado: boolean | null
          saldo: number
          updated_at: string | null
          valor: number
          valor_abatido: number | null
        }
        Insert: {
          abatimentos?: Json | null
          clinic_id: string
          concedido_por: string
          created_at?: string | null
          data_adiantamento?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          profissional_id: string
          quitado?: boolean | null
          saldo: number
          updated_at?: string | null
          valor: number
          valor_abatido?: number | null
        }
        Update: {
          abatimentos?: Json | null
          clinic_id?: string
          concedido_por?: string
          created_at?: string | null
          data_adiantamento?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          profissional_id?: string
          quitado?: boolean | null
          saldo?: number
          updated_at?: string | null
          valor?: number
          valor_abatido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_adiantamentos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_adiantamentos_concedido_por_fkey"
            columns: ["concedido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_adiantamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes_ajustes: {
        Row: {
          created_at: string | null
          criado_por: string
          id: string
          justificativa: string
          provisao_id: string
          tipo_ajuste: string
          valor: number
        }
        Insert: {
          created_at?: string | null
          criado_por: string
          id?: string
          justificativa: string
          provisao_id: string
          tipo_ajuste: string
          valor: number
        }
        Update: {
          created_at?: string | null
          criado_por?: string
          id?: string
          justificativa?: string
          provisao_id?: string
          tipo_ajuste?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_ajustes_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_ajustes_provisao_id_fkey"
            columns: ["provisao_id"]
            isOneToOne: false
            referencedRelation: "comissoes_provisoes"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes_provisoes: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          clinic_id: string
          competencia: string
          conta_pagar_id: string | null
          created_at: string | null
          fechado_em: string | null
          fechado_por: string | null
          financial_transaction_id: string | null
          id: string
          observacoes: string | null
          profissional_id: string
          status: Database["public"]["Enums"]["status_comissao"] | null
          updated_at: string | null
          valor_adiantamentos: number | null
          valor_ajustes: number | null
          valor_devido: number
          valor_inss: number | null
          valor_irrf: number | null
          valor_iss: number | null
          valor_liquido_pagar: number | null
          valor_minimo_garantido: number | null
          valor_producao_bruta: number | null
          valor_producao_liquida: number | null
          valor_producao_recebida: number | null
          valor_provisionado: number
          valor_teto_aplicado: number | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          clinic_id: string
          competencia: string
          conta_pagar_id?: string | null
          created_at?: string | null
          fechado_em?: string | null
          fechado_por?: string | null
          financial_transaction_id?: string | null
          id?: string
          observacoes?: string | null
          profissional_id: string
          status?: Database["public"]["Enums"]["status_comissao"] | null
          updated_at?: string | null
          valor_adiantamentos?: number | null
          valor_ajustes?: number | null
          valor_devido: number
          valor_inss?: number | null
          valor_irrf?: number | null
          valor_iss?: number | null
          valor_liquido_pagar?: number | null
          valor_minimo_garantido?: number | null
          valor_producao_bruta?: number | null
          valor_producao_liquida?: number | null
          valor_producao_recebida?: number | null
          valor_provisionado: number
          valor_teto_aplicado?: number | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          clinic_id?: string
          competencia?: string
          conta_pagar_id?: string | null
          created_at?: string | null
          fechado_em?: string | null
          fechado_por?: string | null
          financial_transaction_id?: string | null
          id?: string
          observacoes?: string | null
          profissional_id?: string
          status?: Database["public"]["Enums"]["status_comissao"] | null
          updated_at?: string | null
          valor_adiantamentos?: number | null
          valor_ajustes?: number | null
          valor_devido?: number
          valor_inss?: number | null
          valor_irrf?: number | null
          valor_iss?: number | null
          valor_liquido_pagar?: number | null
          valor_minimo_garantido?: number | null
          valor_producao_bruta?: number | null
          valor_producao_liquida?: number | null
          valor_producao_recebida?: number | null
          valor_provisionado?: number
          valor_teto_aplicado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_provisoes_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_provisoes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_provisoes_fechado_por_fkey"
            columns: ["fechado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_provisoes_financial_transaction_id_fkey"
            columns: ["financial_transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_provisoes_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_clinica: {
        Row: {
          clinica_id: string
          created_at: string | null
          email_contato: string | null
          horario_funcionamento: Json | null
          id: string
          imprimir_papel_timbrado: boolean | null
          logotipo_url: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          clinica_id: string
          created_at?: string | null
          email_contato?: string | null
          horario_funcionamento?: Json | null
          id?: string
          imprimir_papel_timbrado?: boolean | null
          logotipo_url?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          clinica_id?: string
          created_at?: string | null
          email_contato?: string | null
          horario_funcionamento?: Json | null
          id?: string
          imprimir_papel_timbrado?: boolean | null
          logotipo_url?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_clinica_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: true
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_nf: {
        Row: {
          clinica_id: string
          created_at: string | null
          csc: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          regime_tributario: string | null
          serie_nf: string | null
          updated_at: string | null
        }
        Insert: {
          clinica_id: string
          created_at?: string | null
          csc?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          regime_tributario?: string | null
          serie_nf?: string | null
          updated_at?: string | null
        }
        Update: {
          clinica_id?: string
          created_at?: string | null
          csc?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          regime_tributario?: string | null
          serie_nf?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_nf_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: true
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          allowlist_tenants: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          key: string
          module_id: string | null
          name: string
          rollout_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          allowlist_tenants?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          key: string
          module_id?: string | null
          name: string
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          allowlist_tenants?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          key?: string
          module_id?: string | null
          name?: string
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          category: string | null
          clinic_id: string
          created_at: string | null
          date: string
          id: string
          reference: string | null
          type: string
          updated_at: string | null
          value: number
        }
        Insert: {
          category?: string | null
          clinic_id: string
          created_at?: string | null
          date: string
          id?: string
          reference?: string | null
          type: string
          updated_at?: string | null
          value: number
        }
        Update: {
          category?: string | null
          clinic_id?: string
          created_at?: string | null
          date?: string
          id?: string
          reference?: string | null
          type?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      laboratorios: {
        Row: {
          ativo: boolean | null
          clinica_id: string
          condicoes_comerciais: string | null
          created_at: string | null
          forma_pagamento: string | null
          id: string
          nome: string
          prazo_medio_dias: number | null
          responsavel: string | null
          tabela_procedimentos: Json | null
          telefone: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean | null
          clinica_id: string
          condicoes_comerciais?: string | null
          created_at?: string | null
          forma_pagamento?: string | null
          id?: string
          nome: string
          prazo_medio_dias?: number | null
          responsavel?: string | null
          tabela_procedimentos?: Json | null
          telefone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean | null
          clinica_id?: string
          condicoes_comerciais?: string | null
          created_at?: string | null
          forma_pagamento?: string | null
          id?: string
          nome?: string
          prazo_medio_dias?: number | null
          responsavel?: string | null
          tabela_procedimentos?: Json | null
          telefone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "laboratorios_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      limites_uso: {
        Row: {
          clinica_id: string
          created_at: string | null
          id: string
          mensagens_enviadas: number | null
          mes_referencia: string
          pacientes_totais: number | null
          updated_at: string | null
        }
        Insert: {
          clinica_id: string
          created_at?: string | null
          id?: string
          mensagens_enviadas?: number | null
          mes_referencia: string
          pacientes_totais?: number | null
          updated_at?: string | null
        }
        Update: {
          clinica_id?: string
          created_at?: string | null
          id?: string
          mensagens_enviadas?: number | null
          mes_referencia?: string
          pacientes_totais?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "limites_uso_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_documents: {
        Row: {
          budget_id: string | null
          clinic_id: string
          content: string
          contract_value: number | null
          created_at: string
          created_by: string
          document_type: string
          id: string
          metadata: Json | null
          patient_address: string | null
          patient_birth_date: string | null
          patient_cpf: string | null
          patient_id: string
          procedures_list: string | null
          professional_cpf: string | null
          professional_id: string | null
          signature_hash: string | null
          signed_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          budget_id?: string | null
          clinic_id: string
          content: string
          contract_value?: number | null
          created_at?: string
          created_by: string
          document_type: string
          id?: string
          metadata?: Json | null
          patient_address?: string | null
          patient_birth_date?: string | null
          patient_cpf?: string | null
          patient_id: string
          procedures_list?: string | null
          professional_cpf?: string | null
          professional_id?: string | null
          signature_hash?: string | null
          signed_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          budget_id?: string | null
          clinic_id?: string
          content?: string
          contract_value?: number | null
          created_at?: string
          created_by?: string
          document_type?: string
          id?: string
          metadata?: Json | null
          patient_address?: string | null
          patient_birth_date?: string | null
          patient_cpf?: string | null
          patient_id?: string
          procedures_list?: string | null
          professional_cpf?: string | null
          professional_id?: string | null
          signature_hash?: string | null
          signed_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_documents_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_documents_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          original_name: string
          patient_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          original_name: string
          patient_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          original_name?: string
          patient_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_files_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_portal_access: {
        Row: {
          active: boolean
          created_at: string
          id: string
          patient_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          patient_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          patient_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_portal_access_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_portal_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          patient_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          patient_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          patient_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_portal_invites_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          clinic_id: string
          cpf: string | null
          created_at: string | null
          email: string | null
          full_name: string
          gender: string | null
          how_found: string | null
          id: string
          is_foreign: boolean | null
          notes: string | null
          phone: string
          responsible_birth_date: string | null
          responsible_cpf: string | null
          responsible_name: string | null
          responsible_phone: string | null
          rg: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          clinic_id: string
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          how_found?: string | null
          id?: string
          is_foreign?: boolean | null
          notes?: string | null
          phone: string
          responsible_birth_date?: string | null
          responsible_cpf?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          rg?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          clinic_id?: string
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          how_found?: string | null
          id?: string
          is_foreign?: boolean | null
          notes?: string | null
          phone?: string
          responsible_birth_date?: string | null
          responsible_cpf?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          rg?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          id: string
          patient_id: string
          payment_date: string | null
          payment_method: string | null
          status: string | null
          updated_at: string | null
          value: number
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          patient_id: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
          value: number
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          created_at: string | null
          id: string
          limites: Json | null
          nome: string
          ordem: number
          recursos: Json | null
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          limites?: Json | null
          nome: string
          ordem: number
          recursos?: Json | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          limites?: Json | null
          nome?: string
          ordem?: number
          recursos?: Json | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      planos_procedimentos: {
        Row: {
          ativo: boolean | null
          clinica_id: string
          created_at: string | null
          id: string
          is_padrao: boolean | null
          nome: string
          percentual_ajuste: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          clinica_id: string
          created_at?: string | null
          id?: string
          is_padrao?: boolean | null
          nome: string
          percentual_ajuste?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          clinica_id?: string
          created_at?: string | null
          id?: string
          is_padrao?: boolean | null
          nome?: string
          percentual_ajuste?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_procedimentos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_procedimentos_itens: {
        Row: {
          created_at: string | null
          id: string
          plano_id: string
          procedimento_id: string
          updated_at: string | null
          valor_customizado: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          plano_id: string
          procedimento_id: string
          updated_at?: string | null
          valor_customizado: number
        }
        Update: {
          created_at?: string | null
          id?: string
          plano_id?: string
          procedimento_id?: string
          updated_at?: string | null
          valor_customizado?: number
        }
        Relationships: [
          {
            foreignKeyName: "planos_procedimentos_itens_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_procedimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_procedimentos_itens_procedimento_id_fkey"
            columns: ["procedimento_id"]
            isOneToOne: false
            referencedRelation: "procedimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      procedimentos: {
        Row: {
          codigo_sistema: string
          created_at: string | null
          descricao: string
          especialidade: string
          id: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          codigo_sistema: string
          created_at?: string | null
          descricao: string
          especialidade: string
          id?: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          codigo_sistema?: string
          created_at?: string | null
          descricao?: string
          especialidade?: string
          id?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      producao_eventos: {
        Row: {
          budget_item_id: string | null
          clinic_id: string
          coautores: Json | null
          convenio: string | null
          created_at: string | null
          data_execucao: string
          data_recebimento: string | null
          forma_pagamento: string | null
          id: string
          orcamento_id: string | null
          origem: string | null
          paciente_id: string
          procedimento_codigo: string | null
          procedimento_nome: string
          processado: boolean | null
          profissional_id: string
          regra_base_calculo:
            | Database["public"]["Enums"]["base_calculo_repasse"]
            | null
          regra_percentual: number | null
          status_recebimento: string | null
          taxas_descontos: number | null
          updated_at: string | null
          valor_bruto: number
          valor_liquido: number
          valor_recebido: number | null
          valor_repasse_calculado: number | null
        }
        Insert: {
          budget_item_id?: string | null
          clinic_id: string
          coautores?: Json | null
          convenio?: string | null
          created_at?: string | null
          data_execucao: string
          data_recebimento?: string | null
          forma_pagamento?: string | null
          id?: string
          orcamento_id?: string | null
          origem?: string | null
          paciente_id: string
          procedimento_codigo?: string | null
          procedimento_nome: string
          processado?: boolean | null
          profissional_id: string
          regra_base_calculo?:
            | Database["public"]["Enums"]["base_calculo_repasse"]
            | null
          regra_percentual?: number | null
          status_recebimento?: string | null
          taxas_descontos?: number | null
          updated_at?: string | null
          valor_bruto: number
          valor_liquido: number
          valor_recebido?: number | null
          valor_repasse_calculado?: number | null
        }
        Update: {
          budget_item_id?: string | null
          clinic_id?: string
          coautores?: Json | null
          convenio?: string | null
          created_at?: string | null
          data_execucao?: string
          data_recebimento?: string | null
          forma_pagamento?: string | null
          id?: string
          orcamento_id?: string | null
          origem?: string | null
          paciente_id?: string
          procedimento_codigo?: string | null
          procedimento_nome?: string
          processado?: boolean | null
          profissional_id?: string
          regra_base_calculo?:
            | Database["public"]["Enums"]["base_calculo_repasse"]
            | null
          regra_percentual?: number | null
          status_recebimento?: string | null
          taxas_descontos?: number | null
          updated_at?: string | null
          valor_bruto?: number
          valor_liquido?: number
          valor_recebido?: number | null
          valor_repasse_calculado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "producao_eventos_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producao_eventos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producao_eventos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producao_eventos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      product_suppliers: {
        Row: {
          created_at: string
          id: string
          lead_time_dias: number | null
          preco_melhor: number | null
          preco_ultimo: number | null
          product_id: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_time_dias?: number | null
          preco_melhor?: number | null
          preco_ultimo?: number | null
          product_id: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_time_dias?: number | null
          preco_melhor?: number | null
          preco_ultimo?: number | null
          product_id?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_suppliers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ativo: boolean
          categoria: string | null
          cfop_padrao: string | null
          clinica_id: string
          codigo_interno: string
          controle_lote: boolean
          controle_validade: boolean
          created_at: string
          ean: string | null
          estoque_maximo: number | null
          estoque_minimo: number | null
          fator_conversao: number | null
          foto_url: string | null
          id: string
          lead_time_dias: number | null
          local_padrao_id: string | null
          marca: string | null
          margem_alvo: number | null
          metodo_custeio: Database["public"]["Enums"]["metodo_custeio"]
          ncm: string | null
          nome: string
          preco_venda: number | null
          sku: string | null
          subcategoria: string | null
          unidade: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          cfop_padrao?: string | null
          clinica_id: string
          codigo_interno: string
          controle_lote?: boolean
          controle_validade?: boolean
          created_at?: string
          ean?: string | null
          estoque_maximo?: number | null
          estoque_minimo?: number | null
          fator_conversao?: number | null
          foto_url?: string | null
          id?: string
          lead_time_dias?: number | null
          local_padrao_id?: string | null
          marca?: string | null
          margem_alvo?: number | null
          metodo_custeio?: Database["public"]["Enums"]["metodo_custeio"]
          ncm?: string | null
          nome: string
          preco_venda?: number | null
          sku?: string | null
          subcategoria?: string | null
          unidade?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          cfop_padrao?: string | null
          clinica_id?: string
          codigo_interno?: string
          controle_lote?: boolean
          controle_validade?: boolean
          created_at?: string
          ean?: string | null
          estoque_maximo?: number | null
          estoque_minimo?: number | null
          fator_conversao?: number | null
          foto_url?: string | null
          id?: string
          lead_time_dias?: number | null
          local_padrao_id?: string | null
          marca?: string | null
          margem_alvo?: number | null
          metodo_custeio?: Database["public"]["Enums"]["metodo_custeio"]
          ncm?: string | null
          nome?: string
          preco_venda?: number | null
          sku?: string | null
          subcategoria?: string | null
          unidade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_local_padrao_id_fkey"
            columns: ["local_padrao_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          atualizado_por: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          clinic_id: string | null
          complemento: string | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string
          foto_perfil_url: string | null
          full_name: string
          fuso_horario: string | null
          id: string
          numero: string | null
          phone: string | null
          rua: string | null
          telefone: string | null
          telefone_fixo: string | null
          uf: string | null
          ultima_atualizacao: string | null
          updated_at: string | null
        }
        Insert: {
          atualizado_por?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          clinic_id?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email: string
          foto_perfil_url?: string | null
          full_name: string
          fuso_horario?: string | null
          id: string
          numero?: string | null
          phone?: string | null
          rua?: string | null
          telefone?: string | null
          telefone_fixo?: string | null
          uf?: string | null
          ultima_atualizacao?: string | null
          updated_at?: string | null
        }
        Update: {
          atualizado_por?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          clinic_id?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string
          foto_perfil_url?: string | null
          full_name?: string
          fuso_horario?: string | null
          id?: string
          numero?: string | null
          phone?: string | null
          rua?: string | null
          telefone?: string | null
          telefone_fixo?: string | null
          uf?: string | null
          ultima_atualizacao?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      profissionais: {
        Row: {
          ativo: boolean | null
          clinica_id: string
          created_at: string | null
          cro: string | null
          email: string
          especialidade: string | null
          id: string
          nome: string
          perfil: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          clinica_id: string
          created_at?: string | null
          cro?: string | null
          email: string
          especialidade?: string | null
          id?: string
          nome: string
          perfil?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          clinica_id?: string
          created_at?: string | null
          cro?: string | null
          email?: string
          especialidade?: string | null
          id?: string
          nome?: string
          perfil?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      profissional_agenda_audit: {
        Row: {
          action: string
          changed_by: string
          changes: Json | null
          created_at: string | null
          id: string
          profissional_id: string
        }
        Insert: {
          action: string
          changed_by: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          profissional_id: string
        }
        Update: {
          action?: string
          changed_by?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          profissional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profissional_agenda_audit_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      profissional_agenda_config: {
        Row: {
          almoco_fim: string | null
          almoco_inicio: string | null
          ativo: boolean
          created_at: string | null
          dia_semana: number
          duracao_consulta_minutos: number
          hora_fim: string
          hora_inicio: string
          id: string
          profissional_id: string
          updated_at: string | null
        }
        Insert: {
          almoco_fim?: string | null
          almoco_inicio?: string | null
          ativo?: boolean
          created_at?: string | null
          dia_semana: number
          duracao_consulta_minutos?: number
          hora_fim: string
          hora_inicio: string
          id?: string
          profissional_id: string
          updated_at?: string | null
        }
        Update: {
          almoco_fim?: string | null
          almoco_inicio?: string | null
          ativo?: boolean
          created_at?: string | null
          dia_semana?: number
          duracao_consulta_minutos?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
          profissional_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissional_agenda_config_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      profissional_remuneracao: {
        Row: {
          adiantamento_permitido: boolean | null
          agencia: string | null
          ativo: boolean | null
          banco: string | null
          base_calculo_padrao:
            | Database["public"]["Enums"]["base_calculo_repasse"]
            | null
          chave_pix: string | null
          conta: string | null
          created_at: string | null
          dia_pagamento_fixo: number | null
          gerar_rpa: boolean | null
          id: string
          limite_adiantamento: number | null
          minimo_garantido_mensal: number | null
          modelo_repasse: Database["public"]["Enums"]["modelo_repasse"] | null
          percentual_inss: number | null
          percentual_irrf: number | null
          percentual_iss: number | null
          percentual_unico: number | null
          profissional_id: string
          rateio_centros_custo: Json | null
          responsavel_tributario:
            | Database["public"]["Enums"]["responsavel_tributario"]
            | null
          reter_inss: boolean | null
          reter_irrf: boolean | null
          reter_iss: boolean | null
          teto_repasse_mensal: number | null
          tipo_conta: string | null
          tipo_remuneracao: Database["public"]["Enums"]["tipo_remuneracao"]
          updated_at: string | null
          valor_fixo_mensal: number | null
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          adiantamento_permitido?: boolean | null
          agencia?: string | null
          ativo?: boolean | null
          banco?: string | null
          base_calculo_padrao?:
            | Database["public"]["Enums"]["base_calculo_repasse"]
            | null
          chave_pix?: string | null
          conta?: string | null
          created_at?: string | null
          dia_pagamento_fixo?: number | null
          gerar_rpa?: boolean | null
          id?: string
          limite_adiantamento?: number | null
          minimo_garantido_mensal?: number | null
          modelo_repasse?: Database["public"]["Enums"]["modelo_repasse"] | null
          percentual_inss?: number | null
          percentual_irrf?: number | null
          percentual_iss?: number | null
          percentual_unico?: number | null
          profissional_id: string
          rateio_centros_custo?: Json | null
          responsavel_tributario?:
            | Database["public"]["Enums"]["responsavel_tributario"]
            | null
          reter_inss?: boolean | null
          reter_irrf?: boolean | null
          reter_iss?: boolean | null
          teto_repasse_mensal?: number | null
          tipo_conta?: string | null
          tipo_remuneracao: Database["public"]["Enums"]["tipo_remuneracao"]
          updated_at?: string | null
          valor_fixo_mensal?: number | null
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Update: {
          adiantamento_permitido?: boolean | null
          agencia?: string | null
          ativo?: boolean | null
          banco?: string | null
          base_calculo_padrao?:
            | Database["public"]["Enums"]["base_calculo_repasse"]
            | null
          chave_pix?: string | null
          conta?: string | null
          created_at?: string | null
          dia_pagamento_fixo?: number | null
          gerar_rpa?: boolean | null
          id?: string
          limite_adiantamento?: number | null
          minimo_garantido_mensal?: number | null
          modelo_repasse?: Database["public"]["Enums"]["modelo_repasse"] | null
          percentual_inss?: number | null
          percentual_irrf?: number | null
          percentual_iss?: number | null
          percentual_unico?: number | null
          profissional_id?: string
          rateio_centros_custo?: Json | null
          responsavel_tributario?:
            | Database["public"]["Enums"]["responsavel_tributario"]
            | null
          reter_inss?: boolean | null
          reter_irrf?: boolean | null
          reter_iss?: boolean | null
          teto_repasse_mensal?: number | null
          tipo_conta?: string | null
          tipo_remuneracao?: Database["public"]["Enums"]["tipo_remuneracao"]
          updated_at?: string | null
          valor_fixo_mensal?: number | null
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "profissional_remuneracao_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      protese_movimentacoes: {
        Row: {
          created_at: string | null
          id: string
          observacao: string | null
          protese_id: string
          status_anterior: Database["public"]["Enums"]["status_protese"] | null
          status_novo: Database["public"]["Enums"]["status_protese"]
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          observacao?: string | null
          protese_id: string
          status_anterior?: Database["public"]["Enums"]["status_protese"] | null
          status_novo: Database["public"]["Enums"]["status_protese"]
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          observacao?: string | null
          protese_id?: string
          status_anterior?: Database["public"]["Enums"]["status_protese"] | null
          status_novo?: Database["public"]["Enums"]["status_protese"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protese_movimentacoes_protese_id_fkey"
            columns: ["protese_id"]
            isOneToOne: false
            referencedRelation: "proteses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protese_movimentacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      proteses: {
        Row: {
          atrasado: boolean | null
          clinica_id: string
          created_at: string | null
          custo_laboratorial: number | null
          data_entrega_prevista: string | null
          data_entrega_real: string | null
          data_envio_prevista: string | null
          data_envio_real: string | null
          data_instalacao_prevista: string | null
          data_instalacao_real: string | null
          despesa_id: string | null
          forma_pagamento: string | null
          id: string
          laboratorio_id: string | null
          observacoes: string | null
          orcamento_id: string | null
          paciente_id: string
          procedimento_nome: string
          procedimento_tipo: string
          profissional_id: string
          status: Database["public"]["Enums"]["status_protese"]
          tipo_laboratorio: Database["public"]["Enums"]["tipo_laboratorio"]
          updated_at: string | null
        }
        Insert: {
          atrasado?: boolean | null
          clinica_id: string
          created_at?: string | null
          custo_laboratorial?: number | null
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          data_envio_prevista?: string | null
          data_envio_real?: string | null
          data_instalacao_prevista?: string | null
          data_instalacao_real?: string | null
          despesa_id?: string | null
          forma_pagamento?: string | null
          id?: string
          laboratorio_id?: string | null
          observacoes?: string | null
          orcamento_id?: string | null
          paciente_id: string
          procedimento_nome: string
          procedimento_tipo: string
          profissional_id: string
          status?: Database["public"]["Enums"]["status_protese"]
          tipo_laboratorio?: Database["public"]["Enums"]["tipo_laboratorio"]
          updated_at?: string | null
        }
        Update: {
          atrasado?: boolean | null
          clinica_id?: string
          created_at?: string | null
          custo_laboratorial?: number | null
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          data_envio_prevista?: string | null
          data_envio_real?: string | null
          data_instalacao_prevista?: string | null
          data_instalacao_real?: string | null
          despesa_id?: string | null
          forma_pagamento?: string | null
          id?: string
          laboratorio_id?: string | null
          observacoes?: string | null
          orcamento_id?: string | null
          paciente_id?: string
          procedimento_nome?: string
          procedimento_tipo?: string
          profissional_id?: string
          status?: Database["public"]["Enums"]["status_protese"]
          tipo_laboratorio?: Database["public"]["Enums"]["tipo_laboratorio"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proteses_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proteses_laboratorio_id_fkey"
            columns: ["laboratorio_id"]
            isOneToOne: false
            referencedRelation: "laboratorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proteses_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proteses_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_invoices: {
        Row: {
          chave_acesso: string | null
          clinica_id: string
          created_at: string
          created_by: string
          data_emissao: string
          id: string
          numero: string
          observacoes: string | null
          serie: string | null
          status: Database["public"]["Enums"]["status_nfe"]
          supplier_id: string | null
          updated_at: string
          valor_desconto: number | null
          valor_frete: number | null
          valor_seguro: number | null
          valor_total: number
          xml_file_path: string | null
        }
        Insert: {
          chave_acesso?: string | null
          clinica_id: string
          created_at?: string
          created_by: string
          data_emissao: string
          id?: string
          numero: string
          observacoes?: string | null
          serie?: string | null
          status?: Database["public"]["Enums"]["status_nfe"]
          supplier_id?: string | null
          updated_at?: string
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_seguro?: number | null
          valor_total: number
          xml_file_path?: string | null
        }
        Update: {
          chave_acesso?: string | null
          clinica_id?: string
          created_at?: string
          created_by?: string
          data_emissao?: string
          id?: string
          numero?: string
          observacoes?: string | null
          serie?: string | null
          status?: Database["public"]["Enums"]["status_nfe"]
          supplier_id?: string | null
          updated_at?: string
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_seguro?: number | null
          valor_total?: number
          xml_file_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_invoices_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          batch_id: string | null
          created_at: string
          custo_total: number
          custo_unitario: number
          data_validade: string | null
          desconto_rateado: number | null
          descricao_nfe: string
          frete_rateado: number | null
          id: string
          invoice_id: string
          location_id: string | null
          product_id: string | null
          quantidade: number
          seguro_rateado: number | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          custo_total: number
          custo_unitario: number
          data_validade?: string | null
          desconto_rateado?: number | null
          descricao_nfe: string
          frete_rateado?: number | null
          id?: string
          invoice_id: string
          location_id?: string | null
          product_id?: string | null
          quantidade: number
          seguro_rateado?: number | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          custo_total?: number
          custo_unitario?: number
          data_validade?: string | null
          desconto_rateado?: number | null
          descricao_nfe?: string
          frete_rateado?: number | null
          id?: string
          invoice_id?: string
          location_id?: string | null
          product_id?: string | null
          quantidade?: number
          seguro_rateado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "purchase_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      repasse_regras: {
        Row: {
          ativo: boolean | null
          base_calculo: Database["public"]["Enums"]["base_calculo_repasse"]
          convenio: string | null
          created_at: string | null
          id: string
          origem: string | null
          percentual: number
          prioridade: number | null
          procedimento_codigo: string | null
          procedimento_nome: string | null
          remuneracao_id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          base_calculo: Database["public"]["Enums"]["base_calculo_repasse"]
          convenio?: string | null
          created_at?: string | null
          id?: string
          origem?: string | null
          percentual: number
          prioridade?: number | null
          procedimento_codigo?: string | null
          procedimento_nome?: string | null
          remuneracao_id: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          base_calculo?: Database["public"]["Enums"]["base_calculo_repasse"]
          convenio?: string | null
          created_at?: string | null
          id?: string
          origem?: string | null
          percentual?: number
          prioridade?: number | null
          procedimento_codigo?: string | null
          procedimento_nome?: string | null
          remuneracao_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repasse_regras_remuneracao_id_fkey"
            columns: ["remuneracao_id"]
            isOneToOne: false
            referencedRelation: "profissional_remuneracao"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          clinic_id: string
          comment: string | null
          created_at: string | null
          id: string
          patient_id: string
          rating: number
          review_date: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          patient_id: string
          rating: number
          review_date?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string
          rating?: number
          review_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_log: {
        Row: {
          changed_by: string
          created_at: string | null
          id: string
          new_role: Database["public"]["Enums"]["perfil_usuario"]
          old_role: Database["public"]["Enums"]["perfil_usuario"] | null
          user_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string | null
          id?: string
          new_role: Database["public"]["Enums"]["perfil_usuario"]
          old_role?: Database["public"]["Enums"]["perfil_usuario"] | null
          user_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string | null
          id?: string
          new_role?: Database["public"]["Enums"]["perfil_usuario"]
          old_role?: Database["public"]["Enums"]["perfil_usuario"] | null
          user_id?: string
        }
        Relationships: []
      }
      stock_kit_items: {
        Row: {
          created_at: string
          id: string
          kit_id: string
          product_id: string
          quantidade: number
        }
        Insert: {
          created_at?: string
          id?: string
          kit_id: string
          product_id: string
          quantidade: number
        }
        Update: {
          created_at?: string
          id?: string
          kit_id?: string
          product_id?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "stock_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_kit_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_kits: {
        Row: {
          ativo: boolean
          clinica_id: string
          codigo_procedimento: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          clinica_id: string
          codigo_procedimento: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          clinica_id?: string
          codigo_procedimento?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_kits_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_locations: {
        Row: {
          ativo: boolean
          clinica_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          clinica_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          clinica_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_locations_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_moves: {
        Row: {
          batch_id: string | null
          clinica_id: string
          created_at: string
          custo_total: number
          custo_unitario: number
          doc_id: string | null
          doc_tipo: string | null
          id: string
          location_from_id: string | null
          location_to_id: string | null
          observacoes: string | null
          product_id: string
          quantidade: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          usuario_id: string
        }
        Insert: {
          batch_id?: string | null
          clinica_id: string
          created_at?: string
          custo_total: number
          custo_unitario: number
          doc_id?: string | null
          doc_tipo?: string | null
          id?: string
          location_from_id?: string | null
          location_to_id?: string | null
          observacoes?: string | null
          product_id: string
          quantidade: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          usuario_id: string
        }
        Update: {
          batch_id?: string | null
          clinica_id?: string
          created_at?: string
          custo_total?: number
          custo_unitario?: number
          doc_id?: string | null
          doc_tipo?: string | null
          id?: string
          location_from_id?: string | null
          location_to_id?: string | null
          observacoes?: string | null
          product_id?: string
          quantidade?: number
          tipo?: Database["public"]["Enums"]["tipo_movimentacao_estoque"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_moves_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_moves_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_moves_location_from_id_fkey"
            columns: ["location_from_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_moves_location_to_id_fkey"
            columns: ["location_to_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_moves_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stocks: {
        Row: {
          batch_id: string | null
          created_at: string
          custo_medio: number
          fifo_layers: Json | null
          id: string
          location_id: string
          product_id: string
          quantidade: number
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          custo_medio?: number
          fifo_layers?: Json | null
          id?: string
          location_id: string
          product_id: string
          quantidade?: number
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          custo_medio?: number
          fifo_layers?: Json | null
          id?: string
          location_id?: string
          product_id?: string
          quantidade?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stocks_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          ativo: boolean
          clinica_id: string
          cnpj: string | null
          condicoes_pagamento: string | null
          contato_email: string | null
          contato_nome: string | null
          contato_telefone: string | null
          contato_whatsapp: string | null
          created_at: string
          endereco: Json | null
          id: string
          ie: string | null
          lead_time_medio_dias: number | null
          nome_fantasia: string | null
          razao_social: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          clinica_id: string
          cnpj?: string | null
          condicoes_pagamento?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          contato_whatsapp?: string | null
          created_at?: string
          endereco?: Json | null
          id?: string
          ie?: string | null
          lead_time_medio_dias?: number | null
          nome_fantasia?: string | null
          razao_social: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          clinica_id?: string
          cnpj?: string | null
          condicoes_pagamento?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          contato_whatsapp?: string | null
          created_at?: string
          endereco?: Json | null
          id?: string
          ie?: string | null
          lead_time_medio_dias?: number | null
          nome_fantasia?: string | null
          razao_social?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      system_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          payload_diff: Json | null
          resource: string
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          payload_diff?: Json | null
          resource: string
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          payload_diff?: Json | null
          resource?: string
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      system_modules: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      system_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          included_modules: Json | null
          is_active: boolean | null
          limits: Json | null
          metered_items: Json | null
          monthly_price: number | null
          name: string
          slug: string
          trial_days: number | null
          updated_at: string | null
          yearly_price: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          included_modules?: Json | null
          is_active?: boolean | null
          limits?: Json | null
          metered_items?: Json | null
          monthly_price?: number | null
          name: string
          slug: string
          trial_days?: number | null
          updated_at?: string | null
          yearly_price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          included_modules?: Json | null
          is_active?: boolean | null
          limits?: Json | null
          metered_items?: Json | null
          monthly_price?: number | null
          name?: string
          slug?: string
          trial_days?: number | null
          updated_at?: string | null
          yearly_price?: number | null
        }
        Relationships: []
      }
      templates_contratos: {
        Row: {
          ativo: boolean | null
          clinica_id: string
          conteudo: string
          created_at: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string | null
          variaveis_disponiveis: string[] | null
        }
        Insert: {
          ativo?: boolean | null
          clinica_id: string
          conteudo: string
          created_at?: string | null
          id?: string
          nome: string
          tipo: string
          updated_at?: string | null
          variaveis_disponiveis?: string[] | null
        }
        Update: {
          ativo?: boolean | null
          clinica_id?: string
          conteudo?: string
          created_at?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string | null
          variaveis_disponiveis?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_contratos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_feature_overrides: {
        Row: {
          created_at: string | null
          created_by: string | null
          feature_flag_id: string | null
          id: string
          is_enabled: boolean
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          feature_flag_id?: string | null
          id?: string
          is_enabled: boolean
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          feature_flag_id?: string | null
          id?: string
          is_enabled?: boolean
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_feature_overrides_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_feature_overrides_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_evolutions: {
        Row: {
          budget_item_id: string
          created_at: string | null
          description: string
          evolution_date: string
          id: string
          image_url: string | null
          patient_id: string
          professional_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          budget_item_id: string
          created_at?: string | null
          description: string
          evolution_date?: string
          id?: string
          image_url?: string | null
          patient_id: string
          professional_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_item_id?: string
          created_at?: string | null
          description?: string
          evolution_date?: string
          id?: string
          image_url?: string | null
          patient_id?: string
          professional_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_evolutions_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_evolutions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_evolutions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          created_at: string | null
          id: string
          name: string
          observations: string | null
          patient_id: string
          professional_id: string
          status: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          observations?: string | null
          patient_id: string
          professional_id: string
          status?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          observations?: string | null
          patient_id?: string
          professional_id?: string
          status?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "treatments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          consentido: boolean | null
          created_at: string | null
          data_consentimento: string | null
          data_revogacao: string | null
          id: string
          revogado: boolean | null
          tipo_consentimento: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consentido?: boolean | null
          created_at?: string | null
          data_consentimento?: string | null
          data_revogacao?: string | null
          id?: string
          revogado?: boolean | null
          tipo_consentimento: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consentido?: boolean | null
          created_at?: string | null
          data_consentimento?: string | null
          data_revogacao?: string | null
          id?: string
          revogado?: boolean | null
          tipo_consentimento?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          clinic_id: string
          configuracoes: Json | null
          created_at: string | null
          id: string
          resultado_ultimo_teste: string | null
          status: string | null
          tipo_integracao: string
          ultimo_teste: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          configuracoes?: Json | null
          created_at?: string | null
          id?: string
          resultado_ultimo_teste?: string | null
          status?: string | null
          tipo_integracao: string
          ultimo_teste?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          configuracoes?: Json | null
          created_at?: string | null
          id?: string
          resultado_ultimo_teste?: string | null
          status?: string | null
          tipo_integracao?: string
          ultimo_teste?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_integrations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications_settings: {
        Row: {
          agenda_alteracoes: boolean | null
          agenda_lembretes: boolean | null
          agenda_novas_marcacoes: boolean | null
          canal_email: boolean | null
          canal_in_app: boolean | null
          canal_whatsapp: boolean | null
          created_at: string | null
          financeiro_falha_pagamento: boolean | null
          financeiro_faturas: boolean | null
          financeiro_repasses: boolean | null
          id: string
          operacao_estoque_baixo: boolean | null
          operacao_integracoes_erro: boolean | null
          operacao_protese_pronta: boolean | null
          pacientes_consentimentos: boolean | null
          pacientes_novos_documentos: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agenda_alteracoes?: boolean | null
          agenda_lembretes?: boolean | null
          agenda_novas_marcacoes?: boolean | null
          canal_email?: boolean | null
          canal_in_app?: boolean | null
          canal_whatsapp?: boolean | null
          created_at?: string | null
          financeiro_falha_pagamento?: boolean | null
          financeiro_faturas?: boolean | null
          financeiro_repasses?: boolean | null
          id?: string
          operacao_estoque_baixo?: boolean | null
          operacao_integracoes_erro?: boolean | null
          operacao_protese_pronta?: boolean | null
          pacientes_consentimentos?: boolean | null
          pacientes_novos_documentos?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agenda_alteracoes?: boolean | null
          agenda_lembretes?: boolean | null
          agenda_novas_marcacoes?: boolean | null
          canal_email?: boolean | null
          canal_in_app?: boolean | null
          canal_whatsapp?: boolean | null
          created_at?: string | null
          financeiro_falha_pagamento?: boolean | null
          financeiro_faturas?: boolean | null
          financeiro_repasses?: boolean | null
          id?: string
          operacao_estoque_baixo?: boolean | null
          operacao_integracoes_erro?: boolean | null
          operacao_protese_pronta?: boolean | null
          pacientes_consentimentos?: boolean | null
          pacientes_novos_documentos?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          densidade_tabela: string | null
          formato_data: string | null
          formato_hora: string | null
          id: string
          idioma: string | null
          moeda: string | null
          tamanho_maximo_anexo: number | null
          tema: string | null
          tipos_arquivo_permitidos: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          densidade_tabela?: string | null
          formato_data?: string | null
          formato_hora?: string | null
          id?: string
          idioma?: string | null
          moeda?: string | null
          tamanho_maximo_anexo?: number | null
          tema?: string | null
          tipos_arquivo_permitidos?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          densidade_tabela?: string | null
          formato_data?: string | null
          formato_hora?: string | null
          id?: string
          idioma?: string | null
          moeda?: string | null
          tamanho_maximo_anexo?: number | null
          tema?: string | null
          tipos_arquivo_permitidos?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["perfil_usuario"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["perfil_usuario"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["perfil_usuario"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          dispositivo: string | null
          id: string
          ip_address: string | null
          localizacao: string | null
          navegador: string | null
          ultima_atividade: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dispositivo?: string | null
          id?: string
          ip_address?: string | null
          localizacao?: string | null
          navegador?: string | null
          ultima_atividade?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dispositivo?: string | null
          id?: string
          ip_address?: string | null
          localizacao?: string | null
          navegador?: string | null
          ultima_atividade?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          clinica_id: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario"]
          updated_at: string | null
        }
        Insert: {
          clinica_id?: string | null
          created_at?: string | null
          email: string
          id: string
          nome: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          updated_at?: string | null
        }
        Update: {
          clinica_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_configs: {
        Row: {
          access_token: string | null
          business_account_id: string | null
          clinica_id: string
          connected_at: string | null
          connection_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_seen_at: string | null
          phone_number_id: string | null
          qr_code: string | null
          session_data: Json | null
          updated_at: string | null
          webhook_verify_token: string | null
        }
        Insert: {
          access_token?: string | null
          business_account_id?: string | null
          clinica_id: string
          connected_at?: string | null
          connection_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          phone_number_id?: string | null
          qr_code?: string | null
          session_data?: Json | null
          updated_at?: string | null
          webhook_verify_token?: string | null
        }
        Update: {
          access_token?: string | null
          business_account_id?: string | null
          clinica_id?: string
          connected_at?: string | null
          connection_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          phone_number_id?: string | null
          qr_code?: string | null
          session_data?: Json | null
          updated_at?: string | null
          webhook_verify_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_configs_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: true
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_user_onboarding: {
        Args: {
          _clinic_cnpj?: string
          _clinic_name: string
          _clinic_phone?: string
        }
        Returns: Json
      }
      get_user_clinic_id: { Args: { _user_id: string }; Returns: string }
      get_user_perfil: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["perfil_usuario"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["perfil_usuario"]
          _user_id: string
        }
        Returns: boolean
      }
      is_portal_patient: { Args: never; Returns: string }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      base_calculo_repasse: "valor_bruto" | "valor_liquido" | "valor_recebido"
      metodo_custeio: "media_ponderada" | "fifo"
      modelo_repasse:
        | "percentual_unico"
        | "por_procedimento"
        | "por_convenio"
        | "por_origem"
      perfil_usuario:
        | "admin"
        | "dentista"
        | "assistente"
        | "recepcao"
        | "super_admin"
      plano_tipo: "starter" | "pro" | "enterprise"
      responsavel_tributario: "profissional" | "clinica"
      status_assinatura:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
      status_comissao: "provisionado" | "aprovado" | "pago" | "cancelado"
      status_nfe: "pendente" | "conferida" | "lancada" | "cancelada"
      status_protese:
        | "moldagem"
        | "enviado_lab"
        | "em_execucao"
        | "pronto_instalacao"
        | "instalado"
      tipo_laboratorio: "interno" | "externo"
      tipo_movimentacao_estoque:
        | "entrada"
        | "saida"
        | "transferencia"
        | "ajuste"
        | "devolucao"
      tipo_remuneracao: "fixo_mensal" | "repasse_producao" | "hibrido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      base_calculo_repasse: ["valor_bruto", "valor_liquido", "valor_recebido"],
      metodo_custeio: ["media_ponderada", "fifo"],
      modelo_repasse: [
        "percentual_unico",
        "por_procedimento",
        "por_convenio",
        "por_origem",
      ],
      perfil_usuario: [
        "admin",
        "dentista",
        "assistente",
        "recepcao",
        "super_admin",
      ],
      plano_tipo: ["starter", "pro", "enterprise"],
      responsavel_tributario: ["profissional", "clinica"],
      status_assinatura: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
      ],
      status_comissao: ["provisionado", "aprovado", "pago", "cancelado"],
      status_nfe: ["pendente", "conferida", "lancada", "cancelada"],
      status_protese: [
        "moldagem",
        "enviado_lab",
        "em_execucao",
        "pronto_instalacao",
        "instalado",
      ],
      tipo_laboratorio: ["interno", "externo"],
      tipo_movimentacao_estoque: [
        "entrada",
        "saida",
        "transferencia",
        "ajuste",
        "devolucao",
      ],
      tipo_remuneracao: ["fixo_mensal", "repasse_producao", "hibrido"],
    },
  },
} as const
