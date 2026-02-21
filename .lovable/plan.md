
# Modulo de Relatorios Operacionais -- Flowdent v3

## Resumo
Criar um modulo completo de relatorios operacionais na rota `/dashboard/relatorios` com 7 abas (Visao Geral, Pacientes, Consultas, Especialidades, Dentistas, Comparecimento, Retencao), filtros globais, KPIs, graficos via Recharts, tabelas com exportacao PDF/Excel/CSV, e bloco de insights automaticos.

## Dados Disponiveis (sem alteracao no banco)
Todas as queries serao feitas sobre tabelas existentes:
- **appointments**: appointment_date, status, dentist_id, patient_id, title, clinic_id (via profissionais)
- **patients**: full_name, created_at, status, clinic_id, tags
- **profissionais**: nome, especialidade, clinica_id, ativo

## Arquivos a Criar

### 1. `src/pages/dashboard/Relatorios.tsx`
Pagina principal com:
- Filtros globais no topo (periodo, dentista, especialidade, status)
- Tabs: Visao Geral | Pacientes | Consultas | Especialidades | Dentistas | Comparecimento | Retencao
- Logica de carregamento do clinicId (padrao existente)
- Cada aba renderiza um componente dedicado recebendo `clinicId` e `filters`

### 2. `src/pages/dashboard/RelatoriosWrapper.tsx`
Wrapper com autenticacao (mesmo padrao de FinanceiroWrapper)

### 3. `src/components/relatorios/RelatorioFilters.tsx`
Filtros globais:
- DatePicker inicio/fim (padrao Shadcn)
- Select de dentista (query profissionais)
- Select de especialidade (valores unicos de profissionais.especialidade)
- Select de status (realizado, cancelado, remarcado, faltou)
- Botao "Aplicar" e "Limpar"

### 4. `src/components/relatorios/VisaoGeralTab.tsx`
- KPIs: Total pacientes, Ativos (6 meses), Novos no periodo, Total consultas, Taxa comparecimento, Taxa cancelamento, Taxa remarcacao
- Graficos Recharts: Evolucao mensal consultas (BarChart), Pacientes novos (LineChart), Comparecimento vs Faltas (BarChart empilhado)

### 5. `src/components/relatorios/PacientesTab.tsx`
- KPIs: Total, Ativos, Inativos, Sem retorno 12+ meses
- Tabela: Nome, Ultima consulta, Especialidade, Dentista, Status, Total consultas
- Filtro por tipo (implante/ortodontia/geral via tags)

### 6. `src/components/relatorios/ConsultasTab.tsx`
- KPIs: Total, Realizadas, Canceladas, Remarcadas, Faltas
- Graficos: Distribuicao por status (PieChart), Por dia da semana (BarChart), Por horario (BarChart)

### 7. `src/components/relatorios/EspecialidadesTab.tsx`
- Metricas por especialidade com percentual
- Grafico pizza ou barras horizontais
- Evolucao mensal por especialidade

### 8. `src/components/relatorios/DentistasTab.tsx`
- Tabela comparativa: Dentista, Atendimentos, Comparecimento%, Cancelamentos, Procedimentos, Pacientes
- Grafico comparativo (BarChart agrupado)

### 9. `src/components/relatorios/ComparecimentoTab.tsx`
- Taxa geral
- Faltas por dia da semana, por horario, por dentista, por especialidade
- Graficos de calor/barras

### 10. `src/components/relatorios/RetencaoTab.tsx`
- Pacientes que retornaram, Intervalo medio entre consultas
- Pacientes sem retorno 6+ meses
- Taxa de retencao
- Coorte simples: novos -> retornaram

### 11. `src/components/relatorios/InsightsAutomaticos.tsx`
- Bloco fixo no topo ou lateral com insights gerados automaticamente
- Compara periodo atual vs anterior
- Ex: "Taxa de cancelamento subiu 12%", "26 pacientes sem retorno ha 1 ano"

### 12. `src/hooks/useRelatorioExport.tsx`
- Hook para exportar CSV, Excel (xlsx) e PDF (jspdf) com filtros aplicados
- Reutiliza padroes do useReportExport existente

## Alteracoes em Arquivos Existentes

### `src/components/DomainRouter.tsx`
- Adicionar rota: `<Route path="/dashboard/relatorios" element={<RelatoriosWrapper />} />`
- Adicionar lazy import do RelatoriosWrapper

## Padrao Visual
- KPIs em cards horizontais (4 por linha)
- Graficos Recharts com ChartContainer/ChartTooltip do projeto
- Tabelas com DataTable existente (ordenacao, paginacao, busca)
- Botoes de exportacao no canto superior direito de cada secao
- Layout enterprise consistente com o resto do sistema

## Permissoes
- Admin: acesso total
- Dentista: filtra automaticamente apenas seus proprios dados (dentist_id = user profissional)
- Recepcao: apenas abas Consultas e Comparecimento

## Performance
- Queries filtradas por clinic_id e periodo no Supabase
- Paginacao real nas tabelas
- Loading states com Skeleton
- Dados agregados no frontend (contagens, percentuais) -- sem necessidade de functions backend para MVP
