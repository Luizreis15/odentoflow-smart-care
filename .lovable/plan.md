

# CRM WhatsApp — Rebuild Completo com Infraestrutura Real

## Diagnóstico
- Tabelas `crm_conversations`, `crm_contacts`, `crm_messages` **não existem** no banco
- Conexão QR Code é **simulada** (setTimeout de 10s marca como conectado)
- Envio de mensagens só insere em tabela inexistente, sem integração real
- Contatos da clínica (pacientes) nunca são carregados no CRM

## Estratégia de Integração WhatsApp

A integração real com WhatsApp requer um provedor externo. O sistema já referencia **Z-API** nas Edge Functions existentes (`send-whatsapp`). Para uma integração real, precisamos:

1. **Z-API** (já referenciado no código) — serviço brasileiro de API WhatsApp que funciona via instância web
2. Credenciais: `instance_id` e `instance_token` (configurados pela clínica na tela de config)

A Z-API já é o provedor escolhido no `send-whatsapp/index.ts`. Vamos manter essa escolha e construir o CRM em torno dela.

## Plano de Implementação

### 1. Criar tabelas no banco de dados
```sql
-- Contatos do CRM (sincronizados com pacientes + contatos avulsos)
CREATE TABLE crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(clinica_id, phone)
);

-- Conversas
CREATE TABLE crm_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, active, closed
  assigned_to UUID REFERENCES auth.users(id),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count INT DEFAULT 0,
  kanban_stage TEXT DEFAULT 'novo', -- novo, em_atendimento, aguardando, finalizado
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mensagens
CREATE TABLE crm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES crm_conversations(id) ON DELETE CASCADE NOT NULL,
  whatsapp_message_id TEXT,
  content TEXT,
  is_from_me BOOLEAN DEFAULT false,
  sender_id UUID,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, read, failed, received
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Respostas rápidas
CREATE TABLE crm_quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  shortcut TEXT,
  category TEXT DEFAULT 'geral',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE crm_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE crm_conversations;
```

RLS policies para todas as tabelas filtrando por `clinica_id` do usuário autenticado.

### 2. Sincronizar pacientes como contatos
- Ao abrir o CRM, verificar pacientes da clínica que têm telefone e não existem em `crm_contacts`
- Criar automaticamente contatos para esses pacientes (sync one-way)
- Permitir adicionar contatos avulsos (não-pacientes)

### 3. Refatorar tela CRM Atendimento
O `CRMAtendimento.tsx` será reescrito com:

- **Aba Contatos**: Lista todos os contatos (pacientes sincronizados + avulsos), busca, filtros por tag
- **Aba Conversas/Chat**: Layout atual de chat, mas usando tabelas reais
- **Aba Kanban**: Board com colunas (Novo, Em Atendimento, Aguardando, Finalizado) — arrastar conversas entre etapas
- **Aba Respostas Rápidas**: CRUD de templates de mensagem com atalhos (ex: `/bv` = "Bem-vindo!")
- **Aba Campanhas**: (já existe em CRM.tsx, manter link)

### 4. Integração real com Z-API
A Edge Function `send-whatsapp` já faz a chamada para Z-API. O que falta:
- Ao enviar mensagem no chat, chamar `send-whatsapp` ao invés de só inserir no banco
- Webhook `whatsapp-webhook` já processa mensagens recebidas — só precisa das tabelas existirem
- Configuração de WhatsApp: salvar `instance_id` e `instance_token` da Z-API (campos já existem na tabela `whatsapp_config`)

### 5. Arquivos a modificar/criar

| Arquivo | Ação |
|---------|------|
| **Migração SQL** | Criar tabelas crm_contacts, crm_conversations, crm_messages, crm_quick_replies + RLS |
| `src/pages/dashboard/CRMAtendimento.tsx` | Reescrever com abas: Contatos, Chat, Kanban, Respostas Rápidas |
| `src/components/crm/CRMContatos.tsx` | **Novo** — Lista/busca de contatos, sync de pacientes |
| `src/components/crm/CRMKanban.tsx` | **Novo** — Board kanban de conversas |
| `src/components/crm/RespostasRapidas.tsx` | **Novo** — CRUD de templates |
| `src/components/crm/CRMChat.tsx` | **Novo** — Componente de chat extraído, com integração real via send-whatsapp |

### Fora de escopo (requer ação do usuário)
- Criar conta Z-API e configurar instância (o sistema já suporta os campos `instance_id` e `instance_token`)
- A conexão real com WhatsApp depende de ter uma conta Z-API ativa

