
# Correcoes Criticas: Ortodontia x Agenda x Financeiro

## Problema 1: Agendamentos do modo Ortodontia nao aparecem na Agenda

### Diagnostico
O `ConsultaManutencaoModal.tsx` registra consultas apenas na tabela `ortho_appointments`, sem criar um registro correspondente na tabela `appointments` (agenda geral). A Agenda do sistema so consulta `appointments`, entao os slots continuam "vagos".

### Solucao
Ao registrar uma consulta de manutencao ortho, criar tambem um `appointment` na tabela geral `appointments`. O campo `ortho_appointments.appointment_id` (que ja existe no schema) sera preenchido com o ID do agendamento criado, garantindo o vinculo bidirecional.

**Arquivo: `src/components/ortodontia/ConsultaManutencaoModal.tsx`**
- Buscar o `patient_id` do caso ortho antes de salvar
- Inserir na tabela `appointments` com: `patient_id`, `dentist_id` (professional_id), `title` ("Ortodontia - [tipo_consulta]"), `appointment_date` (proxima_consulta_prevista), `duration_minutes` (usar config do profissional ou padrao 15min), `status: "scheduled"`
- Vincular o `appointment.id` no `ortho_appointments.appointment_id`
- Para a `proxima_consulta_prevista`, criar o agendamento futuro na agenda geral tambem

---

## Problema 2: Agenda personalizada por dentista

### Diagnostico
A tabela `profissional_agenda_config` ja existe com campos de `dia_semana`, `hora_inicio`, `hora_fim`, `almoco_inicio/fim` e `duracao_consulta_minutos`. O modal `AgendaProfissionalModal.tsx` ja permite configurar isso. Porem, a `Agenda.tsx` usa apenas o `configuracoes_clinica.horario_funcionamento` (config global da clinica) para gerar os slots -- ignora completamente a config individual do profissional.

### Solucao
Quando um dentista especifico estiver selecionado no filtro da Agenda, carregar a `profissional_agenda_config` desse profissional e usar para gerar os slots de tempo (horarios, intervalos, duracao). Quando o filtro estiver em "Todos", manter o comportamento atual (config da clinica).

**Arquivo: `src/pages/dashboard/Agenda.tsx`**
- Carregar `profissional_agenda_config` para todos os dentistas ativos ao iniciar
- Quando `filters.dentistId !== "all"`, usar a config do profissional selecionado para:
  - Gerar slots de tempo (`generateDynamicTimeSlots`)
  - Definir duracao padrao no formulario de agendamento
  - Mostrar dias ativos daquele profissional na visao semanal
- Adicionar uma aba "Agenda" no `ProfissionalModal.tsx` para acesso rapido (ja existe `AgendaProfissionalModal` -- integrar na modal de edicao do profissional como terceira aba)

**Arquivo: `src/components/configuracoes/ProfissionalModal.tsx`**
- Adicionar terceira aba "Agenda" que renderiza o conteudo do `AgendaProfissionalModal` inline (sem ser dialog separado)

---

## Problema 3: Pagamento via Ortho nao impacta financeiro do paciente

### Diagnostico
O `OrthoFinanceiroTab.tsx` exibe as parcelas (receivable_titles com ortho_case_id) mas NAO tem nenhum botao de "Pagar" ou "Registrar Pagamento". Nao existe integracao com o `PaymentDrawer`. Logo, a unica forma de baixar parcelas e pela aba Financeiro do paciente (que ja funciona pois ambos consultam `receivable_titles`).

### Solucao
Integrar o `PaymentDrawer` diretamente no `OrthoFinanceiroTab`:
- Adicionar botao "Pagar" em cada parcela pendente/aberta
- Ao clicar, abrir o `PaymentDrawer` com os dados do titulo
- Apos pagamento, oferecer emissao de recibo (ja funciona no PaymentDrawer)
- Invalidar queries do financeiro do paciente para refletir a baixa em ambos os modulos

**Arquivo: `src/components/ortodontia/OrthoFinanceiroTab.tsx`**
- Importar `PaymentDrawer`
- Adicionar state para `selectedTitulo` e `paymentDrawerOpen`
- Adicionar botao "Pagar" nas parcelas com status != "paid"
- Renderizar `PaymentDrawer` no final do componente
- No `onSuccess`, invalidar queries de financeiro do paciente tambem

---

## Resumo de Arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/ortodontia/ConsultaManutencaoModal.tsx` | Criar appointment na agenda geral ao registrar consulta orto |
| `src/pages/dashboard/Agenda.tsx` | Usar config do profissional quando filtrado por dentista |
| `src/components/ortodontia/OrthoFinanceiroTab.tsx` | Integrar PaymentDrawer para baixa de parcelas com recibo |
| `src/components/configuracoes/ProfissionalModal.tsx` | Adicionar aba "Agenda" para config inline |

### Sem alteracoes no banco de dados
Todas as tabelas e colunas necessarias ja existem (`ortho_appointments.appointment_id`, `profissional_agenda_config`, `receivable_titles.ortho_case_id`).
