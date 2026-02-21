
# Plano de Correcoes do FlowDent - Fase 1

Vamos atacar os problemas mais criticos primeiro, organizados por prioridade.

---

## 1. Isolamento Multi-Tenant (CRITICO - Seguranca)

### Problema
Queries de dados em modulos-chave nao filtram por `clinic_id`, permitindo que uma clinica veja dados de outra.

### Correcoes

**`src/pages/dashboard/Prontuario.tsx`**
- A funcao `loadPatients()` faz `supabase.from("patients").select("*")` sem filtrar por `clinic_id`
- Corrigir para usar o `clinicId` ja obtido no mesmo componente: `.eq("clinic_id", clinicId)`
- Reordenar o useEffect para so carregar pacientes apos ter o `clinic_id`

**`src/pages/dashboard/Agenda.tsx`**
- `loadData()` carrega pacientes sem filtro de clinica (linha 211-214): `supabase.from("patients").select("id, full_name")`
- `loadAppointments()` carrega todos os agendamentos sem filtro de clinica (linha 279-292)
- Corrigir ambos para filtrar por `clinic_id`

**`src/pages/dashboard/Ortodontia.tsx`**
- Query de `ortho_cases` nao filtra por clinica
- Adicionar filtro por `clinic_id` usando o contexto de auth

**`src/pages/dashboard/Financeiro.tsx`**
- Ja obtem `clinic_id` e filtra transacoes - OK, mas duplica logica de busca de clinic_id em vez de usar `useAuth()`

### Abordagem
Todos esses modulos devem consumir `clinicId` do hook `useAuth()` (que ja existe no AuthContext) em vez de cada um buscar manualmente via `supabase.auth.getUser()` + query em `profiles`. Isso elimina queries redundantes e garante consistencia.

---

## 2. Pagina 404 em Portugues

### Problema
NotFound.tsx esta em ingles ("Oops! Page not found", "Return to Home").

### Correcao
- Traduzir textos para portugues
- Adicionar logo FlowDent e design consistente com o sistema
- Botao para voltar ao dashboard com estilo do sistema

---

## 3. Eliminar Redundancia de clinic_id

### Problema
Prontuario.tsx, Agenda.tsx e Financeiro.tsx fazem cada um sua propria query para descobrir o `clinic_id` do usuario (getUser + profiles). O AuthContext ja fornece isso via `useAuth()`.

### Correcao
- Remover as funcoes `fetchClinicId` / `loadClinicId` manuais
- Importar `useAuth` e usar `clinicId` diretamente do contexto
- Isso reduz de 3 queries por pagina para 0 queries extras

---

## 4. Agenda: Filtro por Range de Data

### Problema
`loadAppointments()` carrega TODOS os agendamentos do banco sem filtro de data. Com o crescimento da clinica, isso vai degradar performance.

### Correcao
- Filtrar por mes visivel (currentMonth): `gte` e `lte` no campo `appointment_date`
- Recarregar ao mudar de mes

---

## 5. Prontuario: Paginacao Basica

### Problema
Carrega todos os pacientes de uma vez. Clinicas com centenas de pacientes terao lentidao.

### Correcao
- Adicionar paginacao com `.range(from, to)` no Supabase
- UI com botoes "Anterior / Proximo" e contador de paginas
- Manter busca textual funcionando com a paginacao

---

## Detalhes Tecnicos

### Arquivos modificados (6 arquivos)

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/dashboard/Prontuario.tsx` | useAuth(), filtro clinic_id, paginacao |
| `src/pages/dashboard/Agenda.tsx` | useAuth(), filtro clinic_id em patients e appointments, range de data |
| `src/pages/dashboard/Ortodontia.tsx` | useAuth(), filtro clinic_id em ortho_cases |
| `src/pages/dashboard/Financeiro.tsx` | useAuth() em vez de loadClinicId manual |
| `src/pages/NotFound.tsx` | Traducao PT-BR + design FlowDent |
| `src/hooks/usePermissions.tsx` | Nenhuma mudanca nesta fase (unificacao com AuthContext fica para fase 2) |

### Ordem de implementacao
1. NotFound.tsx (rapido, sem dependencias)
2. Prontuario.tsx (useAuth + clinic_id + paginacao)
3. Agenda.tsx (useAuth + clinic_id + range de data)
4. Ortodontia.tsx (useAuth + clinic_id)
5. Financeiro.tsx (useAuth em vez de manual)

### Sem alteracoes no banco de dados
Todas as tabelas ja possuem coluna `clinic_id`. As correcoes sao apenas no frontend para usar os filtros corretamente.
