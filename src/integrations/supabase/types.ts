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
          clinica_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          clinica_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          clinica_id?: string
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
      profiles: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
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
      usuarios: {
        Row: {
          clinica_id: string
          created_at: string | null
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario"]
          updated_at: string | null
        }
        Insert: {
          clinica_id: string
          created_at?: string | null
          email: string
          id: string
          nome: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          updated_at?: string | null
        }
        Update: {
          clinica_id?: string
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
    }
    Enums: {
      perfil_usuario: "admin" | "dentista" | "assistente" | "recepcao"
      plano_tipo: "starter" | "pro" | "enterprise"
      status_assinatura:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
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
      perfil_usuario: ["admin", "dentista", "assistente", "recepcao"],
      plano_tipo: ["starter", "pro", "enterprise"],
      status_assinatura: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
      ],
    },
  },
} as const
