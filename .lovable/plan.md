

# WhatsApp Marketing + Lembretes + Google Review — Sistema CRM Completo

## Visao Geral

Transformar o CRM (atualmente com dados mockados) em um sistema funcional de comunicacao automatizada via WhatsApp, cobrindo 4 pilares:

1. **Lembretes de consulta** (cron automatico, ja tem estrutura)
2. **Link Google Review pos-consulta** (disparo automatico ao concluir atendimento)
3. **Campanhas de marketing** (segmentadas por perfil de paciente)
4. **Automacoes configuráveis** (recall, aniversario, follow-up)

## Arquitetura

```text
+------------------+     +----------------------+     +-----------+
| Triggers         |     | Edge Functions       |     | Z-API     |
|                  |     |                      |     |           |
| - Cron (18h)     +---->+ send-appointment-    +---->+ WhatsApp  |
| - Status change  |     |   reminders (existe) |     |           |
| - Campanha manual|     |                      |     |           |
| - Cron aniver.   +---->+ send-whatsapp        +---->+           |
|                  |     |   (existe)           |     |           |
+------------------+     |                      |     |           |
                         | send-campaign-msgs   +---->+           |
                         |   (NOVO)             |     |           |
                         +----------------------+     +-----------+
                                   |
                                   v
                         +----------------------+
                         | whatsapp_campaigns   |
                         | whatsapp_automations |
                         | whatsapp_message_log |
                         | clinics.google_      |
                         |   review_link        |
                         +----------------------+
```

## Fase 1 — Banco de Dados (Novas Tabelas e Colunas)

### 1.1 Tabela `whatsapp_campaigns`
Substitui os dados mockados do CRM com campanhas reais.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid PK | |
| clinic_id | uuid FK clinics | |
| name | text | Nome da campanha |
| type | text | recall, aniversario, retorno, promocao, custom |
| message_template | text | Mensagem com placeholders |
| target_segment | jsonb | Filtros (ex: inativos ha 6 meses, aniversariantes) |
| status | text | draft, scheduled, sending, completed, cancelled |
| scheduled_at | timestamptz | Quando disparar |
| sent_count | int | Total enviados |
| response_count | int | Total respostas |
| created_by | uuid FK profiles | |
| created_at / updated_at | timestamptz | |

### 1.2 Tabela `whatsapp_campaign_recipients`
Destinatarios de cada campanha com status individual.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid PK | |
| campaign_id | uuid FK | |
| patient_id | uuid FK patients | |
| phone | text | |
| status | text | pending, sent, delivered, failed |
| sent_at | timestamptz | |
| error_message | text | |

### 1.3 Tabela `whatsapp_automations`
Configuracoes de automacoes ativas por clinica.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid PK | |
| clinic_id | uuid FK | |
| name | text | Ex: Confirmacao, Lembrete, Review, Recall |
| trigger_type | text | pre_appointment, post_appointment, recall, birthday |
| trigger_config | jsonb | Ex: {"hours_before": 24} ou {"months_after": 6} |
| message_template | text | Mensagem com {paciente}, {data}, {link_review} |
| channel | text | whatsapp |
| is_active | boolean | |
| created_at | timestamptz | |

### 1.4 Coluna `google_review_link` na tabela `clinics`
Para armazenar o link do Google Meu Negocio da clinica, usado no disparo pos-consulta.

## Fase 2 — Edge Functions

### 2.1 `send-campaign-messages` (NOVA)
- Recebe `campaign_id`
- Busca recipients pendentes
- Envia em lote via `send-whatsapp` existente
- Atualiza status de cada recipient
- Rate limit: 1 msg/segundo para nao bloquear Z-API

### 2.2 Atualizar `send-whatsapp` (EXISTENTE)
- Adicionar tipo `review` com template que inclui o link do Google
- Adicionar tipo `campaign` para mensagens de campanha
- Suportar placeholder `{link_review}` nos templates

### 2.3 `send-post-appointment-review` (NOVA)
- Disparada quando appointment.status muda para "completed"
- Busca google_review_link da clinica
- Envia mensagem com link de avaliacao
- Registra no whatsapp_message_log com type "review"
- Pode ser chamada via trigger de banco ou pelo frontend ao concluir consulta

## Fase 3 — Frontend (CRM Funcional)

### 3.1 Refatorar `CRM.tsx`
Substituir dados mockados por queries reais:
- Listar campanhas de `whatsapp_campaigns`
- Listar automacoes de `whatsapp_automations`
- Metricas reais de `whatsapp_message_log`

### 3.2 Modal "Nova Campanha"
- Nome, tipo, template de mensagem
- Seletor de segmento (pacientes inativos, aniversariantes do mes, todos)
- Preview da mensagem
- Agendar ou enviar agora
- Ao salvar: cria campanha + gera recipients baseado no segmento

### 3.3 Modal "Configurar Automacoes"
- Lista de automacoes com toggle ativo/inativo
- Editar template de cada automacao
- Configurar trigger (24h antes, apos consulta, 6 meses apos, aniversario)

### 3.4 Configuracao Google Review
- Campo no `ClinicaTab` (Configuracoes) para colar o link do Google Meu Negocio
- Toggle para ativar/desativar envio automatico pos-consulta

### 3.5 Dashboard de metricas
- Total enviados / entregues / falhas (de `whatsapp_message_log`)
- Taxa de resposta das campanhas
- NPS baseado em respostas (futuro)

## Fase 4 — Cron Jobs

### 4.1 Cron para campanhas agendadas
- Roda a cada hora
- Busca campanhas com status "scheduled" e `scheduled_at <= now()`
- Chama `send-campaign-messages` para cada uma

### 4.2 Cron para automacoes de recall/aniversario
- Roda diariamente
- Busca pacientes que se encaixam nos criterios de cada automacao ativa
- Gera e envia mensagens automaticamente

## Ordem de Implementacao

1. Criar tabelas e colunas no banco
2. Atualizar `send-whatsapp` com tipos `review` e `campaign`
3. Criar `send-post-appointment-review` (Google Review pos-consulta)
4. Criar `send-campaign-messages` (disparo de campanhas)
5. Refatorar CRM.tsx com dados reais
6. Criar modal Nova Campanha
7. Criar modal Configurar Automacoes
8. Adicionar campo Google Review nas configuracoes da clinica
9. Configurar crons para campanhas agendadas e automacoes

