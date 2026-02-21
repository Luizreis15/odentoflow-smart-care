

# PRD: Modulo de Ortodontia - FlowDent

## Visao Geral

Criar um modulo completo de ortodontia dentro do FlowDent, atendendo as necessidades especificas desta especialidade: acompanhamento de casos de longa duracao, cobranca recorrente (mensalidades), gestao de pacientes menores com responsaveis financeiros, controle de alinhadores invisiveis e banco de imagens clinicas organizado por fases do tratamento.

## Contexto do Projeto

O FlowDent ja possui infraestrutura robusta que sera reutilizada:
- **patient_contacts**: tabela existente para cadastro de responsaveis (com CPF, relacao, contato)
- **budgets + financial_responsible_contact_id**: ja suporta responsavel financeiro diferente do paciente
- **financial_recurrences**: sistema de cobranca recorrente ja implementado
- **patient_files + Storage**: sistema de upload de imagens ja funcional
- **treatment_evolutions**: sistema de evolucoes de tratamento existente
- **Proteses (Kanban)**: padrao visual de acompanhamento de fluxo que pode ser adaptado

---

## Fase 1 - Caso Ortodontico (Base do Modulo)

### Objetivo
Criar a entidade central "caso ortodontico" vinculada a um paciente, com dados clinicos especificos da ortodontia.

### Tabela: `ortho_cases`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid PK | Identificador |
| clinic_id | uuid FK clinicas | Clinica |
| patient_id | uuid FK patients | Paciente |
| professional_id | uuid FK profissionais | Ortodontista responsavel |
| responsible_contact_id | uuid FK patient_contacts (nullable) | Responsavel financeiro (menores) |
| tipo_tratamento | text | 'aparelho_fixo', 'alinhadores', 'movel', 'contencao', 'ortopedia' |
| classificacao_angle | text (nullable) | Classe I, II div 1, II div 2, III |
| tipo_mordida | text (nullable) | Normal, aberta, profunda, cruzada, topo |
| apinhamento | text (nullable) | Leve, moderado, severo |
| arcada | text | 'superior', 'inferior', 'ambas' |
| marca_aparelho | text (nullable) | Marca do aparelho/alinhador |
| data_inicio | date | Data de inicio do tratamento |
| previsao_termino | date (nullable) | Previsao de termino |
| data_termino | date (nullable) | Data real de termino |
| status | text | 'planejamento', 'ativo', 'contencao', 'finalizado', 'abandonado' |
| valor_total | numeric | Valor total do tratamento |
| valor_entrada | numeric (nullable) | Valor da entrada |
| valor_mensalidade | numeric (nullable) | Valor da parcela mensal |
| dia_vencimento | int (nullable) | Dia do vencimento da mensalidade |
| total_meses | int (nullable) | Duracao prevista em meses |
| observacoes_clinicas | text (nullable) | Notas clinicas gerais |
| budget_id | uuid FK budgets (nullable) | Orcamento vinculado |
| created_at, updated_at | timestamptz | Auditoria |

### Tabela: `ortho_appointments` (Consultas de Manutencao)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid PK | |
| case_id | uuid FK ortho_cases | Caso ortodontico |
| appointment_id | uuid FK appointments (nullable) | Vinculo com agenda |
| data_consulta | date | Data da consulta |
| tipo_consulta | text | 'ativacao', 'colagem', 'troca_fio', 'troca_alinhador', 'emergencia', 'documentacao', 'moldagem', 'contencao', 'remocao' |
| numero_alinhador | int (nullable) | Numero do alinhador atual (para casos de alinhadores) |
| fio_utilizado | text (nullable) | Tipo/numero do fio |
| elasticos | text (nullable) | Configuracao de elasticos |
| procedimentos_realizados | text (nullable) | Descricao livre |
| observacoes | text (nullable) | |
| proxima_consulta_prevista | date (nullable) | |
| professional_id | uuid FK profissionais | Quem atendeu |
| created_at | timestamptz | |

### Tabela: `ortho_images` (Banco de Imagens Clinicas)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid PK | |
| case_id | uuid FK ortho_cases | |
| file_path | text | Caminho no storage |
| tipo_imagem | text | 'frontal', 'perfil', 'sorriso', 'intraoral_frontal', 'intraoral_lateral_dir', 'intraoral_lateral_esq', 'intraoral_oclusal_sup', 'intraoral_oclusal_inf', 'panoramica', 'cefalometrica', 'periapical', 'outro' |
| fase | text | 'inicial', 'progresso', 'final', 'contencao' |
| data_registro | date | |
| descricao | text (nullable) | |
| uploaded_by | uuid FK profiles | |
| created_at | timestamptz | |

### Tabela: `ortho_aligner_tracking` (Controle de Alinhadores)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid PK | |
| case_id | uuid FK ortho_cases | |
| numero_alinhador | int | Numero sequencial |
| total_alinhadores | int | Total de alinhadores no set |
| data_entrega | date (nullable) | Data que entregou ao paciente |
| data_troca_prevista | date (nullable) | Data prevista para trocar |
| data_troca_real | date (nullable) | Data que efetivamente trocou |
| dias_uso | int | Dias de uso recomendados (padrao 14) |
| refinamento | boolean | Se e alinhador de refinamento |
| observacoes | text (nullable) | |
| created_at | timestamptz | |

---

## Fase 2 - Interface do Usuario

### 2.1 Pagina Principal: `/dashboard/ortodontia`

Lista de casos ortodonticos ativos com:
- Filtros: status, profissional, tipo de tratamento
- Cards com: nome paciente, tipo tratamento, progresso (meses decorridos / total), proximo retorno
- Indicadores visuais: atrasados, proximos retornos, alinhadores pendentes de troca

### 2.2 Detalhes do Caso: Modal ou sub-rota

Tabs internas:
1. **Resumo**: dados clinicos, responsavel, datas, status, progresso visual
2. **Consultas**: timeline de manutencoes com tipo, fio, elasticos
3. **Alinhadores**: tabela de tracking com status de cada alinhador (somente para tipo 'alinhadores')
4. **Imagens**: galeria organizada por fase (inicial/progresso/final) com tipos pre-definidos
5. **Financeiro**: resumo de mensalidades pagas/pendentes, link para contas a receber

### 2.3 Nova Consulta de Manutencao

Modal com campos especificos de ortodontia:
- Tipo de consulta (ativacao, troca de fio, etc.)
- Fio utilizado, elasticos
- Numero do alinhador (se aplicavel)
- Procedimentos realizados
- Data da proxima consulta
- Opcao de agendar automaticamente na agenda

### 2.4 Galeria de Imagens Ortodonticas

- Upload com selecao de tipo (frontal, perfil, intraoral, etc.)
- Selecao de fase (inicial, progresso, final)
- Visualizacao comparativa lado-a-lado (antes/durante/depois)
- Grid organizado por data ou por fase

### 2.5 Aba "Ortodontia" no Prontuario do Paciente

Nova aba no `PatientDetails.tsx` que lista os casos ortodonticos do paciente com acesso rapido ao detalhamento.

---

## Fase 3 - Integracao Financeira

### Cobranca Recorrente

Ao criar um caso ortodontico com mensalidade:
1. Gerar um orcamento (budget) automaticamente com o valor total
2. Aprovar o orcamento para criar os titulos a receber (receivable_titles)
3. Opcionalmente criar uma recorrencia financeira (financial_recurrences) para mensalidades
4. Vincular o `responsible_contact_id` como pagador quando o paciente for menor

### Responsavel Financeiro

A tabela `patient_contacts` ja suporta o cadastro de responsaveis. O campo `financial_responsible_contact_id` nos budgets ja permite vincular o responsavel. O modulo de ortodontia apenas facilita esse fluxo com UI dedicada.

---

## Fase 4 - Roteamento e Navegacao

### Novos arquivos de rota

| Arquivo | Descricao |
|--------|-----------|
| `src/pages/dashboard/Ortodontia.tsx` | Pagina principal do modulo |
| `src/pages/dashboard/OrtodontiaWrapper.tsx` | Wrapper com DashboardLayout |

### Atualizacoes em roteamento

| Arquivo | Mudanca |
|--------|---------|
| `src/components/DomainRouter.tsx` | Adicionar rota `/dashboard/ortodontia` |
| `src/components/DashboardLayout.tsx` | Adicionar item "Ortodontia" no menu lateral |
| `src/components/dashboard/ModuleCards.tsx` | Adicionar card do modulo Ortodontia |
| `src/pages/dashboard/PatientDetails.tsx` | Adicionar aba "Ortodontia" nas tabs |

---

## Arquivos a Criar

| Arquivo | Descricao |
|--------|-----------|
| `src/pages/dashboard/Ortodontia.tsx` | Pagina principal com lista de casos |
| `src/pages/dashboard/OrtodontiaWrapper.tsx` | Wrapper de layout |
| `src/components/ortodontia/NovoCasoModal.tsx` | Modal de criacao de caso |
| `src/components/ortodontia/DetalhesCasoModal.tsx` | Modal de detalhes com tabs |
| `src/components/ortodontia/ConsultaManutencaoModal.tsx` | Modal de nova consulta |
| `src/components/ortodontia/AlignerTrackingTab.tsx` | Tab de controle de alinhadores |
| `src/components/ortodontia/OrthoImagesTab.tsx` | Tab de galeria de imagens |
| `src/components/ortodontia/OrthoFinanceiroTab.tsx` | Tab financeira do caso |
| `src/components/ortodontia/OrthoTimelineTab.tsx` | Timeline de consultas |
| `src/components/ortodontia/OrthoPatientTab.tsx` | Aba Ortodontia no prontuario |

## Arquivos a Modificar

| Arquivo | Mudanca |
|--------|---------|
| `src/components/DomainRouter.tsx` | Nova rota |
| `src/components/DashboardLayout.tsx` | Menu lateral |
| `src/components/dashboard/ModuleCards.tsx` | Card Ortodontia |
| `src/pages/dashboard/PatientDetails.tsx` | Nova aba |

---

## Detalhes Tecnicos

### Migracao SQL (4 tabelas + RLS)

As tabelas serao criadas com RLS habilitado. As policies seguirao o padrao do projeto: validacao via `get_user_clinic_id(auth.uid())` para garantir isolamento por clinica.

Indexes recomendados:
- `ortho_cases(clinic_id, status)`
- `ortho_cases(patient_id)`
- `ortho_appointments(case_id, data_consulta)`
- `ortho_images(case_id, fase)`
- `ortho_aligner_tracking(case_id, numero_alinhador)`

### Storage

Reutiliza o bucket `patient-files` existente, com path pattern: `{patient_id}/ortodontia/{case_id}/{filename}`

### Padrao de Componentes

Segue os mesmos padroes do modulo de Proteses:
- Cards com badges de status
- Modais de criacao e detalhes
- Queries com `@tanstack/react-query`
- Toasts com `sonner`
- Tabelas responsivas (desktop table + mobile cards)

---

## Ordem de Implementacao Sugerida

Dado o tamanho do modulo, a implementacao deve ser feita em etapas:

1. **Etapa 1**: Migracao SQL (criar as 4 tabelas com RLS) + Pagina principal com lista de casos + NovoCasoModal
2. **Etapa 2**: DetalhesCasoModal com tabs de Resumo e Timeline de consultas + ConsultaManutencaoModal
3. **Etapa 3**: AlignerTrackingTab (controle de alinhadores)
4. **Etapa 4**: OrthoImagesTab (galeria de imagens clinicas com upload)
5. **Etapa 5**: Integracao financeira (geracao de orcamento + recorrencia) + OrthoFinanceiroTab
6. **Etapa 6**: Aba Ortodontia no PatientDetails + Navegacao (rotas, menu, ModuleCards)

Cada etapa pode ser solicitada individualmente para manter as mudancas gerenciaveis.

