

## Plano: Atalhos estratégicos para o Prontuário do Paciente

### Objetivo
Tornar o nome do paciente clicável em todos os locais onde aparece, redirecionando para `/dashboard/prontuario/{patient_id}` — facilitando o acesso rápido ao prontuário.

### Locais que serão alterados

1. **Agenda — Day Slots View** (`src/pages/dashboard/Agenda.tsx`, ~linha 748)
   - O nome do paciente nos slots ocupados será um link clicável para o prontuário
   - Adicionar `e.stopPropagation()` para não abrir o modal de detalhes ao clicar no nome
   - Usar `useNavigate` (já importado via `react-router-dom`) + estilo de link (underline on hover, cursor pointer)

2. **Agenda — Week View** (`src/pages/dashboard/Agenda.tsx`, ~linha 979)
   - O nome do paciente na célula semanal será clicável para o prontuário
   - `e.stopPropagation()` para não disparar o `handleAppointmentClick`

3. **Agenda — Detalhes do Agendamento Modal** (`src/components/agenda/DetalhesAgendamentoModal.tsx`, ~linha 234)
   - O nome do paciente no modal será um link clicável para o prontuário
   - Adicionar botão "Abrir Prontuário" nas ações do modal

4. **Dashboard — Agenda do Dia (tabela)** (`src/components/dashboard/DashboardAgendaTable.tsx`, ~linha 122)
   - A coluna "Paciente" na tabela do dashboard será um link clicável
   - Usar `useNavigate` para redirecionar

5. **Dashboard — Próximas Consultas** (`src/components/dashboard/UpcomingAppointments.tsx`, ~linha 83)
   - O nome do paciente será clicável

6. **Mobile — Agenda List** (`src/components/mobile/MobileAgendaList.tsx`)
   - Já redireciona para prontuário no `onClick` do card — manter como está

7. **Mobile — MobileAgenda** (`src/pages/mobile/MobileAgenda.tsx`)
   - Já redireciona para prontuário no `onClick` — manter como está

### Detalhes técnicos
- Estilo do link: `hover:underline text-primary cursor-pointer` no nome do paciente
- Navegação: `navigate(\`/dashboard/prontuario/\${patientId}\`)`
- `e.stopPropagation()` em todos os locais onde o clique no nome conflita com um clique no container pai (slot, card, row)
- No modal de detalhes: adicionar um botão "Ir ao Prontuário" com ícone `FileText`

