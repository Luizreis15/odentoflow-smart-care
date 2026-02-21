

# Otimizacao de Performance -- Carregamento de Paginas

## Problema
Cada pagina do dashboard executa 3-4 queries sequenciais de autenticacao (session, user_roles, profiles, clinicas) antes de renderizar qualquer conteudo. Isso causa 800ms-1.5s de tela em branco em cada navegacao.

## Solucao: AuthProvider Centralizado

### Arquitetura Atual (lenta)

```text
Usuario clica em "Ortodontia"
  → Wrapper: getSession() .............. 200ms
  → Wrapper: query user_roles .......... 150ms
  → Wrapper: query profiles ............ 150ms
  → Wrapper: query clinicas ............ 150ms
  → Carrega componente Ortodontia
  → Ortodontia: query ortho_cases ...... 200ms
  TOTAL: ~850ms de espera
```

### Arquitetura Nova (rapida)

```text
Login (1 vez):
  → AuthProvider: getSession + profiles + roles + clinica ... cached

Usuario clica em "Ortodontia"
  → Wrapper: le do AuthContext (0ms, ja em memoria)
  → Carrega componente Ortodontia
  → Ortodontia: query ortho_cases ...... 200ms
  TOTAL: ~200ms de espera
```

## Implementacao

### 1. Criar `src/contexts/AuthContext.tsx` (novo arquivo)
- Centraliza toda a logica de autenticacao em um unico Provider
- Faz as queries de session, profile, user_roles e clinica **uma unica vez** no login
- Armazena em estado: `user`, `profile`, `clinicId`, `isSuperAdmin`, `isImpersonating`
- Expoe hook `useAuth()` para qualquer componente consumir
- Escuta `onAuthStateChange` para reagir a login/logout
- Inclui funcao `refreshProfile()` para recarregar manualmente quando necessario

### 2. Atualizar `src/App.tsx`
- Envolver o app com `<AuthProvider>` (dentro do BrowserRouter, para ter acesso ao navigate)
- Mover o AuthProvider para dentro do BrowserRouter

### 3. Simplificar TODOS os Wrappers (14 arquivos)
Cada Wrapper sera reduzido de ~70 linhas para ~15 linhas:

Arquivos afetados:
- `src/pages/dashboard/OrtodontiaWrapper.tsx`
- `src/pages/dashboard/RelatoriosWrapper.tsx`
- `src/pages/dashboard/AgendaWrapper.tsx`
- `src/pages/dashboard/ProntuarioWrapper.tsx`
- `src/pages/dashboard/FinanceiroWrapper.tsx`
- `src/pages/dashboard/CRMWrapper.tsx`
- `src/pages/dashboard/CRMAtendimentoWrapper.tsx`
- `src/pages/dashboard/PortalPacienteWrapper.tsx`
- `src/pages/dashboard/IAAssistenteWrapper.tsx`
- `src/pages/dashboard/ProtesesWrapper.tsx`
- `src/pages/dashboard/EstoqueWrapper.tsx`
- `src/pages/dashboard/ProdutosWrapper.tsx`
- `src/pages/dashboard/MovimentacoesWrapper.tsx`
- `src/pages/dashboard/PerfilWrapper.tsx`
- `src/pages/dashboard/ConfiguracoesWrapper.tsx`
- `src/pages/dashboard/AssinaturaWrapper.tsx`

Cada wrapper passara de:
```
useEffect com 4 queries sequenciais ao banco
if (loading) return null
```
Para:
```
const { profile, isLoading } = useAuth()
if (isLoading) return skeleton
```

### 4. Simplificar `src/pages/Dashboard.tsx`
- Remover toda a logica de auth duplicada (60+ linhas)
- Consumir `useAuth()` diretamente
- Manter toda a renderizacao existente

### 5. Otimizar `src/contexts/SubscriptionContext.tsx`
- Nao chamar Edge Function no mount inicial
- Fazer lazy check: so chamar `check-subscription` quando o dashboard efetivamente renderizar
- Reduzir intervalo de auto-refresh de 60s para 5 minutos

## Resultado Esperado
- Navegacao entre paginas do dashboard: de ~850ms para ~200ms
- Primeira carga apos login: mesma velocidade (queries feitas 1 vez)
- Reducao de ~50 queries por sessao tipica para ~10
- Tela em branco eliminada (skeletons imediatos em vez de `return null`)

## Arquivos Criados
1. `src/contexts/AuthContext.tsx`

## Arquivos Modificados
1. `src/App.tsx` (adicionar AuthProvider)
2. `src/pages/Dashboard.tsx` (simplificar auth)
3. `src/contexts/SubscriptionContext.tsx` (lazy check)
4. 16 Wrapper files (simplificar para useAuth)

## Sem Impacto Visual
Nenhuma alteracao de layout, cores ou componentes. Apenas logica interna de carregamento.

