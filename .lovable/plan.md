

# Analise de Prontidao do SaaS para Venda - 10 Correcoes e Melhorias Criticas

## Resultado da Analise

O sistema tem uma base solida (autenticacao, multi-tenancy, financeiro auditado, Stripe integrado), porem possui **lacunas criticas** que impediriam a venda segura a terceiros. Abaixo, as 10 correcoes ordenadas por prioridade.

---

### 1. Rotas desprotegidas - Nao existe ProtectedRoute

**Problema**: Nenhuma rota do `/dashboard/*` valida se o usuario esta autenticado. Qualquer pessoa pode acessar `/dashboard/financeiro` diretamente. O `AuthContext` carrega dados, mas nao bloqueia acesso. Nao ha componente `ProtectedRoute` ou `RequireAuth`.

**Correcao**: Criar componente `ProtectedRoute` que redireciona para `/auth` se `!isAuthenticated`, e envolver todas as rotas `/dashboard/*` e `/super-admin/*` com ele.

---

### 2. Nao existe controle de acesso por perfil (RBAC no frontend)

**Problema**: O `hasPermission()` no AuthContext retorna `true` para admin/super_admin e `false` para todos os outros perfis. Uma recepcionista ve os mesmos menus que um admin. Dentistas acessam financeiro, configuracoes, CRM. Nao ha restricao por `perfil` (dentista, recepcao, assistente).

**Correcao**: Implementar mapa de permissoes por perfil. Ocultar itens do sidebar e bloquear rotas conforme o perfil do usuario.

---

### 3. Nao ha barreira de assinatura (Paywall)

**Problema**: O `useSubscription` verifica o status mas nenhuma pagina bloqueia o acesso. Um usuario com `status: "no_subscription"` ou trial expirado continua usando o sistema normalmente. O trial banner e apenas informativo.

**Correcao**: Criar middleware/guard que redireciona usuarios sem assinatura ativa para a pagina `/dashboard/assinatura`, permitindo apenas essa rota e `/dashboard/perfil`.

---

### 4. Nao existe Error Boundary

**Problema**: Zero `ErrorBoundary` no projeto. Qualquer erro de renderizacao em qualquer componente causa tela branca para o usuario, sem nenhuma mensagem ou opcao de recuperacao.

**Correcao**: Criar `ErrorBoundary` global envolvendo o `App` e boundaries especificos por modulo (Agenda, Financeiro, etc.) com UI de fallback amigavel e botao "Tentar novamente".

---

### 5. Dados sensiveis no localStorage (Impersonacao)

**Problema**: O sistema armazena o estado de impersonacao (`admin_impersonation`) no `localStorage`, incluindo `clinicId` e `clinicName`. Qualquer usuario pode manipular esse valor e potencialmente acessar dados de outra clinica se conseguir um `clinicId` valido.

**Correcao**: Mover a logica de impersonacao para o backend (session claim ou tabela com validacao server-side). A verificacao deve ser feita via RLS/edge function, nao confiando no localStorage.

---

### 6. Edge Functions sem verificacao JWT

**Problema**: 13 edge functions estao com `verify_jwt = false` no `config.toml` (approve-budget, record-payment, send-whatsapp, etc.). Qualquer pessoa pode invocar essas funcoes sem autenticacao, potencialmente aprovando orcamentos, registrando pagamentos ou enviando mensagens.

**Correcao**: Habilitar `verify_jwt = true` para funcoes que exigem autenticacao (approve-budget, record-payment, generate-ortho-installments, etc.). Manter `verify_jwt = false` apenas para webhooks externos (whatsapp-webhook).

---

### 7. Sem rate limiting nas operacoes criticas

**Problema**: Nenhum rate limiting em login, cadastro, ou chamadas a edge functions. Um atacante pode fazer brute-force no login, criar milhares de contas, ou invocar funcoes financeiras repetidamente.

**Correcao**: Implementar rate limiting no frontend (debounce nos forms, desabilitar botoes apos submit) e no backend (rate limiting nas edge functions criticas via headers ou contador em banco).

---

### 8. Cadastro permite "paciente" como funcao/atuacao

**Problema**: Na tela de cadastro (`Cadastro.tsx`), o campo "funcao/atuacao" inclui "Paciente" como opcao. Isso nao faz sentido para o fluxo de criacao de clinica - um paciente nao deveria poder criar uma clinica. Tambem nao ha validacao de email duplicado antes do submit.

**Correcao**: Remover "Paciente" das opcoes de cadastro. Adicionar verificacao de email duplicado antes do Step 2.

---

### 9. Sem pagina de Termos de Uso e Politica de Privacidade

**Problema**: O link "termos de uso" no cadastro aponta para `/` (landing page). Para vender a terceiros, e obrigatorio (LGPD) ter paginas reais de Termos de Uso e Politica de Privacidade.

**Correcao**: Criar paginas `/termos` e `/privacidade` com conteudo juridico real. Atualizar os links no cadastro e no footer.

---

### 10. Nao existe Stripe Webhook para sincronizar assinatura

**Problema**: A verificacao de assinatura e feita on-demand via `check-subscription` (chamada do frontend ao Stripe). Se o cartao do cliente for recusado, a assinatura cancelada, ou o trial expirar, o sistema so descobre na proxima verificacao (que pode demorar ate 5 minutos). Nao ha webhook do Stripe para atualizar o status em tempo real.

**Correcao**: Criar edge function `stripe-webhook` que recebe eventos como `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` e atualiza a tabela `clinicas` em tempo real.

---

## Resumo de Impacto

| # | Correcao | Tipo | Risco sem correcao |
|---|----------|------|---------------------|
| 1 | ProtectedRoute | Seguranca | Critico - acesso nao autenticado |
| 2 | RBAC frontend | Seguranca | Alto - violacao de privacidade |
| 3 | Paywall | Receita | Critico - uso sem pagamento |
| 4 | Error Boundary | UX | Alto - tela branca |
| 5 | localStorage impersonacao | Seguranca | Alto - escalacao de privilegio |
| 6 | JWT em Edge Functions | Seguranca | Critico - acesso anonimo |
| 7 | Rate Limiting | Seguranca | Medio - brute force |
| 8 | Cadastro paciente | UX/Logica | Baixo - confusao |
| 9 | Termos e Privacidade | Legal/LGPD | Alto - risco juridico |
| 10 | Stripe Webhook | Receita | Alto - dessincronizacao |

## Proximos Passos

Recomendo implementar na ordem: **1 → 6 → 3 → 5 → 10 → 2 → 4 → 7 → 9 → 8**. Posso comecar pela correcao que voce considerar mais urgente.

