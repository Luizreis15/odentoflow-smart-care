
# PRD v3 - Flowdent Desktop Enterprise

## Visao Geral

Transformar o desktop de um layout com sidebar retratil (64px/256px hover) e sem header fixo em uma plataforma SaaS enterprise com sidebar fixa de 260px, header fixo de 64px e conteudo estruturado com padding de 32px.

---

## Fases de Implementacao

### Fase 1 - App Shell Enterprise (Estrutura Base)

**Objetivo:** Sidebar fixa 260px + Header fixo 64px + Content area padronizada

**Alteracoes:**

1. **`src/components/DashboardLayout.tsx`** - Reescrever o layout desktop:
   - Sidebar fixa de 260px (sem hover expand/collapse) com icones + texto sempre visiveis
   - Estado ativo com barra lateral colorida (border-left 3px primary)
   - Sub-itens expansiveis (Estoque -> Painel/Produtos/Movimentacoes)
   - Logo Flowdent no topo da sidebar
   - Header fixo de 64px com: titulo da pagina, breadcrumb, busca global, perfil, notificacoes
   - Content area com padding 32px e fundo `background` (cinza leve)
   - Manter toda a logica mobile (MobileBottomNav, condicional `lg:`)

2. **`src/components/desktop/DesktopHeader.tsx`** (novo) - Header enterprise:
   - Altura fixa 64px
   - Titulo da pagina dinamico (baseado na rota)
   - Breadcrumb (Dashboard > Agenda)
   - Busca global centralizada
   - Icone notificacoes + Avatar/perfil do usuario
   - Nome da clinica visivel

3. **`src/components/desktop/DesktopSidebar.tsx`** (novo) - Sidebar enterprise:
   - Largura fixa 260px
   - Logo no topo
   - Itens: Dashboard, Agenda, Pacientes (renomear Prontuario), Financeiro, Proteses, Ortodontia, Estoque (com sub-itens), CRM, Portal, IA, Relatorios (novo)
   - Hover state sutil, ativo com barra lateral colorida e bg accent
   - Separador visual entre modulos principais e configuracoes

### Fase 2 - Dashboard Enterprise (KPIs + Tabela + Alertas)

**Objetivo:** Dashboard com 3 linhas: KPIs, agenda resumida em tabela, alertas operacionais

**Alteracoes:**

1. **`src/pages/Dashboard.tsx`** - Reestruturar o desktop view:
   - Remover `ModuleCards` do dashboard desktop (sidebar ja tem navegacao)
   - Linha 1: 4 KPIs horizontais (Consultas hoje, Faturamento do dia, Confirmacoes pendentes, Pacientes novos) com comparativo percentual
   - Linha 2: Tabela de agenda resumida com colunas: Hora, Paciente, Procedimento, Status (badge), Dentista
   - Linha 3: Alertas operacionais (pagamentos atrasados, tratamentos nao finalizados, orcamentos pendentes)

2. **`src/components/dashboard/DashboardMetrics.tsx`** - Redesign enterprise:
   - Cards com numero grande, icone discreto, comparativo (seta + percentual vs periodo anterior)
   - Layout horizontal 4 colunas em cards brancos
   - Sem gradientes exagerados, visual limpo

3. **`src/components/dashboard/DashboardAgendaTable.tsx`** (novo) - Tabela agenda do dia:
   - Cabecalho fixo com colunas: Hora, Paciente, Procedimento, Status, Dentista
   - Badge elegante para status (Confirmado=verde, Pendente=amarelo, Cancelado=vermelho)
   - Hover leve nas linhas
   - Sem paginacao (max 10-15 consultas do dia)

4. **`src/components/dashboard/DashboardAlerts.tsx`** (novo) - Alertas operacionais:
   - Cards de alerta com icone, titulo e contagem
   - Categorias: pagamentos atrasados, tratamentos pendentes, orcamentos aguardando

### Fase 3 - Design System Desktop Tokens

**Objetivo:** Refinar tipografia, espacamento e cores para padrao enterprise

**Alteracoes:**

1. **`src/index.css`** - Adicionar tokens desktop:
   - Tipografia desktop: h1 (24-28px), h2 (20px), section (18px), body (14-16px), table (13-14px)
   - Garantir que background geral e cinza leve, cards brancos
   - Sombras controladas (nada exagerado)

2. **`tailwind.config.ts`** - Tokens de espacamento 8pt grid:
   - Garantir que o sistema usa multiplos de 8 (8, 16, 24, 32, 48)

### Fase 4 - Tabelas Profissionais (Padrao ERP)

**Objetivo:** Todas as tabelas do sistema com cabecalho fixo, ordenacao, filtros, paginacao

**Alteracoes:**

1. **`src/components/desktop/DataTable.tsx`** (novo) - Componente de tabela enterprise reutilizavel:
   - Cabecalho fixo (sticky)
   - Ordenacao por coluna (click no header)
   - Filtro por campo
   - Busca global
   - Paginacao elegante (10/25/50 por pagina)
   - Selecao multipla com checkbox
   - Acoes em lote
   - Skeleton loading

2. Migrar tabelas existentes para usar `DataTable`:
   - `ProfissionaisTable.tsx`
   - `UsuariosTable.tsx`
   - `ProdutosTable.tsx`
   - `PlanosTable.tsx`
   - Tabela de pacientes em `Prontuario.tsx`

### Fase 5 - Pagina Paciente (Vista Profissional 2 Colunas)

**Objetivo:** Layout de detalhe do paciente em 2 colunas

**Alteracoes:**

1. **`src/pages/dashboard/PatientDetails.tsx`** - Redesign:
   - Coluna esquerda (1/3): dados pessoais, contato, convenio, historico basico
   - Coluna direita (2/3): tabs com Timeline clinica, Procedimentos, Financeiro, Documentos
   - Header com nome do paciente, avatar, e acoes rapidas

### Fase 6 - Formularios Enterprise

**Objetivo:** Todos os formularios em grid 2-3 colunas desktop, labels fixos, botoes alinhados

**Alteracoes:**

1. Padronizar modais e formularios:
   - Grid 2-3 colunas no desktop (`lg:grid-cols-2` / `lg:grid-cols-3`)
   - Labels sempre acima do input
   - Botao primario a direita, cancelar secundario
   - Inputs padronizados em altura (40px desktop)

### Fase 7 - Performance e Estabilidade

**Objetivo:** Zero reflow, skeleton em tabelas, transicoes suaves

**Alteracoes:**

1. Skeleton loading em todas as tabelas e listas
2. Memoizacao de componentes pesados
3. Verificar responsividade em 1280, 1440 e 1920
4. Zero overflow horizontal

---

## Recomendacao de Execucao

Dado o tamanho do PRD, recomendo implementar **Fase 1** primeiro (App Shell: Sidebar fixa + Header fixo + Content area) pois e a fundacao de todas as outras mudancas. Cada fase subsequente pode ser solicitada com "Fase 2", "Fase 3", etc.

---

## Detalhes Tecnicos

- A sidebar atual usa hover expand/collapse (`w-16` -> `w-64`). Sera substituida por uma sidebar fixa de `w-[260px]` no desktop
- O header atual esta dentro de `Dashboard.tsx`. Sera extraido para um componente dedicado `DesktopHeader.tsx` fixo no layout
- O content tera `ml-[260px]` e `mt-16` no desktop, mantendo o mobile inalterado
- O breakpoint `lg:` (1024px) continuara separando mobile/desktop
- Componente `DataTable` usara estado local para sort/filter/pagination sem dependencias extras
- Todas as alteracoes mantem compatibilidade total com o sistema mobile (Fases 1-6 do PRD v2)
