

# Análise Crítica do Sistema - Pontos de Falha para Teste do Zero

## Problemas Encontrados (por severidade)

### CRÍTICO - Bloqueiam o fluxo de novo usuário

**1. Página de Login sem link para Cadastro**
- `Auth.tsx` (login) não tem nenhum link para `/cadastro`. Um novo usuário que acessar `/auth` não consegue criar conta.
- Correção: Adicionar link "Criar conta" apontando para `/cadastro`.

**2. Tabela `onboarding_sessions` não existe no banco**
- A Edge Function `create-trial-subscription` tenta inserir em `onboarding_sessions`, mas essa tabela nunca foi criada.
- Se essa function for chamada, falhará. No fluxo atual ela não é chamada automaticamente, mas é um ponto morto.

**3. Nenhum Stripe Customer é criado durante onboarding**
- `Clinica.tsx` cria a clínica com `plano: "starter"` e `status_assinatura: "trialing"` diretamente no banco, sem criar customer no Stripe.
- Quando o usuário depois compra um plano via checkout, o webhook do Stripe procura o `profile` pelo email do customer e atualiza `clinicas`. Isso funciona **se** o email do cadastro = email do Stripe checkout. OK, isso funciona.

**4. Race condition no onboarding "Profissional Liberal"**
- `Profissional.tsx` tem um `useEffect` que cria a clínica automaticamente para liberais E o `handleSubmit` também tenta criar se não encontrar. Sem `loading` guard no useEffect, podem criar clínicas duplicadas.

### ALTO - Funcionalidade quebrada

**5. WhatsApp Edge Function com coluna inexistente**
- Logs mostram: `column whatsapp_config.ativo does not exist`. O envio de lembretes por WhatsApp está totalmente inoperante.

**6. `SubscriptionGuard` permite TODAS as rotas /dashboard/***
- A verificação `location.pathname.startsWith(p)` com `/dashboard` na lista permite qualquer sub-rota começando com `/dashboard`, efetivamente desabilitando o guard para todas as rotas do dashboard.
- Correção: usar comparação exata `===` para `/dashboard` e `startsWith` apenas para `/dashboard/assinatura` e `/dashboard/perfil`.

### MÉDIO - Consistência

**7. Plano inicial "starter" é legado**
- Novos planos são `teste`, `solo`, `crescimento`, `premium`. Mas onboarding cria com `plano: "starter"`. O `check-subscription` retorna `plan: "starter"` como default. Deveria ser consistente com os novos nomes.

**8. Período de trial sem data de expiração**
- Clínicas são criadas com `status_assinatura: "trialing"` mas `current_period_end: null`. O `check-subscription` trata isso como "grace period" (acesso perpétuo enquanto trialing sem data).

---

## Plano de Correções (Implementação)

1. **Adicionar link "Criar conta" no Auth.tsx** - Link para `/cadastro` na tela de login
2. **Corrigir SubscriptionGuard** - Comparação exata para `/dashboard`
3. **Corrigir race condition no Profissional.tsx** - Usar ref/flag para evitar criação dupla de clínica liberal
4. **Padronizar plano inicial** - Usar `"starter"` consistentemente ou migrar para novo nome
5. **Criar tabela `onboarding_sessions`** (se necessário) ou remover referência da Edge Function
6. **Corrigir coluna `whatsapp_config.ativo`** - Adicionar coluna ou corrigir query

Essas correções garantem que o teste end-to-end (cadastro → onboarding → dashboard → assinatura) funcione sem bloqueios.

