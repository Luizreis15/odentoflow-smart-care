
# Traduzir palavras em ingles para Portugues do Brasil

## Problema
Alguns componentes exibem palavras em ingles para o usuario final, especialmente nos badges de status de agendamentos (ex: "scheduled" em vez de "Agendado"), nos menus de navegacao e em labels administrativos. Isso prejudica a credibilidade do sistema.

## Arquivos e Alteracoes

### 1. SwipeableAppointmentCard.tsx (Problema Principal - visivel na screenshot)
O componente verifica status em portugues ("confirmado", "agendado") mas o banco armazena em ingles ("confirmed", "scheduled"). O status cai no `default` e exibe o valor bruto em ingles.

**Correcao:** Atualizar o `getStatusConfig` para usar os valores em ingles do banco de dados, mantendo os labels em portugues:
- `"confirmed"` -> label "Confirmado"
- `"scheduled"` -> label "Agendado"  
- `"cancelled"` -> label "Cancelado"
- `"completed"` -> label "Concluido"
- `"no_show"` -> label "Faltou"
- `"waiting"` -> label "Aguardando"

### 2. MobileDrawerMenu.tsx
- `"Dashboard"` -> `"Painel"`

### 3. DashboardLayout.tsx
- Menu lateral: `"Dashboard"` -> `"Painel"`

### 4. AdminLayout.tsx
- `"Dashboard"` -> `"Painel"`
- `"Leads"` -> `"Leads"` (este e um termo aceito em portugues no contexto de marketing)
- `"Marketing"` -> `"Marketing"` (termo aceito)

### 5. Arquivos Admin (Subscriptions.tsx, Clinics.tsx, Dashboard.tsx, Locatarios.tsx)
- `"Trial"` -> `"Teste Gratis"` (em todos os mapeamentos de status)

### 6. ModuleCards.tsx
- `"Marketing"` -> manter (termo tecnico aceito)

### 7. QuickActions.tsx  
- `"Marketing"` -> manter (termo tecnico aceito)

### 8. MobileAgendaList.tsx
- Verificar se os status estao sendo corretamente mapeados (usa SwipeableAppointmentCard que sera corrigido)

## Detalhes Tecnicos

A raiz do problema e a inconsistencia entre os valores armazenados no banco de dados (em ingles: `scheduled`, `confirmed`, `completed`, `cancelled`, `no_show`, `waiting`) e os valores verificados no `SwipeableAppointmentCard.tsx` (em portugues: `confirmado`, `agendado`, `cancelado`, `concluido`). 

A correcao principal e alinhar o `getStatusConfig` do `SwipeableAppointmentCard` com os valores reais do banco, exibindo os labels traduzidos para o usuario.

Para "Trial", a traducao sera "Teste Gratis" nos seguintes arquivos:
- `src/pages/admin/Subscriptions.tsx`
- `src/pages/admin/Clinics.tsx`
- `src/pages/admin/Dashboard.tsx`
- `src/pages/superadmin/Locatarios.tsx`
- `src/pages/admin/Marketing.tsx` (opcao de segmentacao "trial" -> "Teste Gratis")

Para "Dashboard", a traducao sera "Painel" nos menus de navegacao:
- `src/components/mobile/MobileDrawerMenu.tsx`
- `src/components/DashboardLayout.tsx`
- `src/components/AdminLayout.tsx`

Total de arquivos a alterar: **~9 arquivos**
