

# Correção da Integração WhatsApp Z-API — Tornar Operacional

## Diagnóstico

Encontrei 3 problemas que impedem o funcionamento:

### Problema 1: Envio não funciona — tabela errada
A Edge Function `send-whatsapp` consulta a tabela `whatsapp_config` com colunas `clinic_id` e `connected = true`. A tabela real é `whatsapp_configs` com colunas `clinica_id` e `is_active`.

Logs confirmam: `[SEND-WHATSAPP] Config not found: null`

### Problema 2: Recebimento não funciona — webhook com formato Meta
A Edge Function `whatsapp-webhook` espera o payload da API Meta (`entry.changes.value.messages`). A Z-API envia um formato completamente diferente — objeto plano com campos `phone`, `text.message`, `instanceId`, etc.

Além disso, busca configuração por `phone_number_id` (campo da Meta API) que é NULL.

### Problema 3: Webhook não configurado na Z-API
A URL do webhook precisa ser configurada na Z-API via API PUT, apontando para nossa Edge Function.

## Plano de Correções

### 1. Corrigir `send-whatsapp/index.ts`
- Mudar query de `whatsapp_config` → `whatsapp_configs`
- Mudar filtro de `clinic_id` → `clinica_id`
- Mudar filtro de `connected = true` → `is_active = true`
- A URL da Z-API e body já estão corretos (`/send-text` com `{phone, message}`)

### 2. Reescrever `whatsapp-webhook/index.ts` para formato Z-API
O payload da Z-API é um objeto plano:
```text
{
  "instanceId": "3EF19...",
  "phone": "5511999999999",
  "fromMe": false,
  "text": { "message": "teste" },
  "type": "ReceivedCallback",
  "messageId": "...",
  "senderName": "...",
  "connectedPhone": "554499999999"
}
```

A webhook deve:
- Receber POST com esse formato
- Buscar config por `instance_id` (campo que identifica qual clínica)
- Criar/buscar contato em `crm_contacts`
- Criar/buscar conversa em `crm_conversations`
- Inserir mensagem em `crm_messages`

### 3. Configurar webhook na Z-API automaticamente
Adicionar no `ConfigurarWhatsAppModal` (ao salvar com sucesso e is_active=true) uma chamada PUT para a Z-API registrando a URL do webhook:
```
PUT https://api.z-api.io/instances/{ID}/token/{TOKEN}/update-webhook-received
Body: { "value": "https://aiavrxefjnoldukcdywd.supabase.co/functions/v1/whatsapp-webhook" }
```

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/send-whatsapp/index.ts` | Corrigir tabela e colunas na query de config |
| `supabase/functions/whatsapp-webhook/index.ts` | Reescrever para formato Z-API |
| `src/components/crm/ConfigurarWhatsAppModal.tsx` | Ao salvar, registrar webhook na Z-API via PUT |

