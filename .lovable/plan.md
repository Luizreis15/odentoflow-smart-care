

# Plano: Sistema de Permissões Granular por Perfil (RBAC)

## Problema Atual
Hoje o sistema tem apenas duas camadas: **admin/super_admin** (acesso total) e **demais perfis** (acesso limitado apenas por rotas bloqueadas). Não existe controle fino por ação — um dentista vê tudo que um admin vê nas rotas que tem acesso, e uma recepcionista não tem restrição de ações dentro das páginas.

## Arquitetura Proposta

### 1. Tabela de Permissões no Banco

Criar uma tabela `clinic_permissions` que mapeia perfil → permissões granulares por clínica. O admin (master) poderá customizar quais ações cada perfil pode executar.

```text
clinic_permissions
├── id (uuid, PK)
├── clinic_id (uuid, FK → clinicas)
├── perfil (perfil_usuario enum)
├── recurso (text) — ex: "agenda", "financeiro", "estornos"
├── acao (text) — ex: "visualizar", "editar", "excluir"
├── permitido (boolean, default true)
└── unique(clinic_id, perfil, recurso, acao)
```

### 2. Permissões Padrão por Perfil

Ao criar a clínica, o sistema insere automaticamente as permissões padrão via trigger:

```text
DENTISTA:
  ✅ agenda.visualizar (apenas própria)
  ✅ agenda.finalizar_atendimento
  ✅ prontuario.visualizar
  ✅ prontuario.editar (próprios pacientes)
  ✅ odontograma.editar
  ✅ orcamentos.criar
  ✅ comissoes.visualizar (apenas próprias)
  ❌ financeiro.visualizar
  ❌ financeiro.estorno
  ❌ financeiro.reabrir_pagamento
  ❌ relatorios.visualizar
  ❌ configuracoes.visualizar
  ❌ crm.visualizar
  ❌ usuarios.gerenciar

RECEPÇÃO:
  ✅ agenda.visualizar (todas)
  ✅ agenda.criar
  ✅ agenda.editar
  ✅ prontuario.visualizar
  ✅ pacientes.cadastrar
  ✅ orcamentos.visualizar
  ❌ financeiro.estorno
  ❌ financeiro.reabrir_pagamento
  ❌ relatorios.visualizar
  ❌ configuracoes.visualizar
  ❌ usuarios.gerenciar

ASSISTENTE:
  ✅ agenda.visualizar
  ✅ prontuario.visualizar
  ❌ financeiro.* (tudo bloqueado)
  ❌ relatorios.*
  ❌ configuracoes.*
```

### 3. Hook `usePermissions` Refatorado

Substituir o hook atual (deprecated) por um que carrega permissões do banco:

```typescript
const { can } = usePermissions();
// Uso nos componentes:
if (can("financeiro", "estorno")) { /* mostra botão */ }
if (can("agenda", "finalizar_atendimento")) { /* mostra ação */ }
```

As permissões serão carregadas uma vez no login (junto com o AuthContext) e cacheadas em memória.

### 4. Filtro de Agenda por Dentista

Para dentistas, a agenda filtra automaticamente pelo `profissional_id` vinculado ao usuário. O dentista só vê seus próprios agendamentos. Admins e recepção veem todos.

### 5. Comissões Filtradas

Dentistas no módulo financeiro (se tiverem acesso à aba Comissões) verão apenas suas próprias comissões, filtradas pelo ID do profissional.

### 6. Tela de Gerenciamento (Configurações → Usuários)

O admin terá uma interface para customizar permissões por perfil, com toggles agrupados por módulo:

```text
┌─────────────────────────────────────────┐
│ Permissões do Perfil: Recepção          │
├─────────────────────────────────────────┤
│ 📅 Agenda                              │
│   ☑ Visualizar    ☑ Criar    ☑ Editar  │
│ 📋 Prontuário                          │
│   ☑ Visualizar    ☐ Editar             │
│ 💰 Financeiro                          │
│   ☐ Visualizar    ☐ Estornos           │
│   ☐ Reabrir pagamentos                 │
│ 📊 Relatórios                          │
│   ☐ Visualizar                         │
└─────────────────────────────────────────┘
```

### 7. Mudanças nos Arquivos

| Arquivo | Mudança |
|---------|---------|
| **Migration SQL** | Criar tabela `clinic_permissions` + trigger para popular defaults + RLS |
| `src/contexts/AuthContext.tsx` | Carregar permissões do usuário no login |
| `src/hooks/usePermissions.tsx` | Refatorar com `can(recurso, acao)` real |
| `src/components/ProtectedRoute.tsx` | Suportar verificação por `recurso.acao` |
| `src/components/desktop/DesktopSidebar.tsx` | Usar `can()` ao invés de checagem hardcoded |
| `src/components/DomainRouter.tsx` | Adicionar `requiredPermission` nas rotas |
| `src/pages/dashboard/Agenda.tsx` | Filtrar por dentista logado se perfil=dentista |
| `src/pages/dashboard/Financeiro.tsx` | Ocultar tabs/ações conforme permissão |
| `src/components/financeiro/PaymentDrawer.tsx` | Ocultar botão de estorno se sem permissão |
| `src/components/financeiro/ComissoesTab.tsx` | Filtrar por profissional se dentista |
| `src/components/configuracoes/UsuariosTab.tsx` | Adicionar tela de gerenciamento de permissões |

### 8. Segurança

- RLS na tabela `clinic_permissions`: apenas admins da clínica podem alterar
- O hook `can()` é apenas UX — as Edge Functions e RLS continuam validando no backend
- Permissões são imutáveis para `super_admin` e `admin` (sempre acesso total)

