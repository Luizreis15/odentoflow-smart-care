
# Plano: Corrigir Responsividade Mobile e Simplificar Interface

## Problemas Identificados

### 1. Tela "Balança" Horizontalmente
**Causa**: O componente `MobileMetrics.tsx` possui um container com scroll horizontal (`overflow-x-auto`) que permite arrastar a tela para os lados. Os cards de métricas têm `min-w-[130px]` e são scrolláveis horizontalmente.

### 2. Espaço em Branco Entre Topo e Primeira Seção
**Causa**: O `Navbar.tsx` é exibido no mobile (`lg:hidden`) com altura de ~56px, criando um gap visual entre a barra superior e o Hero do `MobileHome`. O Hero inicia dentro do `DashboardLayout` que aplica padding/margin adicional.

### 3. Botão "Novo Orçamento" Não Funciona
**Causa**: No arquivo `CentralFAB.tsx`, o botão "Novo Orçamento" apenas exibe um toast com "Em breve" em vez de navegar para a criação de orçamento:
```typescript
onClick: () => {
  toast({ title: "Em breve", description: "..." });
  setOpen(false);
}
```

### 4. Cards de Métricas "Poluindo" a Interface
**Causa**: Os 4 cards (`Consultas Hoje`, `A Receber`, `Novos Pacientes`, `Pendentes`) ocupam espaço desnecessário e são redundantes, já que o resumo de consultas já aparece no badge do Hero.

---

## Solução Proposta

### Parte 1: Eliminar o "Balanço" Horizontal

Remover o componente `MobileMetrics` completamente do `MobileHome.tsx`, pois a informação de "X consultas hoje" já está no Hero badge.

### Parte 2: Remover Espaço em Branco no Topo

Modificar o `MobileHome.tsx` para usar posicionamento que compense o espaço do Navbar, ou aplicar margin negativa para que o Hero toque o topo visual.

### Parte 3: Corrigir Botão "Novo Orçamento"

Alterar o `CentralFAB.tsx` para navegar para a página de prontuário e abrir a seção de orçamentos:
- Opção A: Navegar para `/dashboard/prontuario?openBudget=true`
- Opção B: Navegar para prontuário com instrução de selecionar paciente

### Parte 4: Simplificar Interface Mobile

- Remover os cards de métricas
- Remover a dica de "deslize para confirmar/cancelar"
- Manter apenas: Hero, Ações Rápidas e Lista de Agendamentos

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/mobile/MobileHome.tsx` | Remover MobileMetrics, ajustar espaçamento do topo |
| `src/components/mobile/CentralFAB.tsx` | Corrigir navegação "Novo Orçamento" |
| `src/components/DashboardLayout.tsx` | Ajustar container mobile para eliminar gaps |

---

## Detalhes Técnicos

### 1. MobileHome.tsx - Simplificação

Remover as seguintes seções:
```typescript
// REMOVER: Import e uso de MobileMetrics
import MobileMetrics from "@/components/mobile/MobileMetrics";
<MobileMetrics metrics={metrics} />

// REMOVER: Array de metrics (linhas 132-157)
const metrics = [...];

// REMOVER: Dica de swipe
<div className="px-4">
  <p className="text-xs text-center...">
    💡 Deslize para a direita...
  </p>
</div>

// REMOVER: Queries desnecessárias
// Manter apenas appointmentsData para o badge do Hero
```

### 2. MobileHome.tsx - Eliminar Espaço no Topo

Ajustar o container para iniciar no topo visual:
```typescript
// Adicionar margin negativa para compensar altura da Navbar
<div 
  className="min-h-screen pb-24 overflow-y-auto overflow-x-hidden -mt-16"
  style={{ width: '100vw', maxWidth: '100vw' }}
>
```

### 3. CentralFAB.tsx - Corrigir Novo Orçamento

```typescript
{
  icon: ClipboardList,
  label: "Novo Orçamento",
  description: "Criar orçamento para paciente",
  color: "text-orange-500",
  bgColor: "bg-orange-500/10",
  onClick: () => {
    // Navegar para prontuário - usuário seleciona paciente e abre orçamentos
    navigate("/dashboard/prontuario");
    setOpen(false);
  },
},
```

### 4. Prevenir Scroll Horizontal

Adicionar ao container principal:
```typescript
<div className="... touch-pan-y" style={{ touchAction: 'pan-y' }}>
```

Isso garante que apenas scroll vertical seja permitido.

---

## Resultado Visual Esperado

### ANTES
```
┌─────────────────────┐
│ Navbar (Flowdent)   │
├─────────────────────┤
│ [espaço em branco]  │
├─────────────────────┤
│ Hero (Bom dia...)   │
├─────────────────────┤
│ Cards rolantes ←→   │  ← "balança" ao tocar
├─────────────────────┤
│ Ações Rápidas       │
├─────────────────────┤
│ Dica de swipe       │
├─────────────────────┤
│ Lista Agendamentos  │
└─────────────────────┘
```

### DEPOIS
```
┌─────────────────────┐
│ Navbar (Flowdent)   │
│ Hero (Bom dia...)   │  ← colado ao topo
├─────────────────────┤
│ Ações Rápidas       │  ← apenas 4 botões úteis
├─────────────────────┤
│ Lista Agendamentos  │  ← direto ao ponto
└─────────────────────┘
```

---

## Fluxo do Botão "Novo Orçamento"

```
1. Usuário clica no FAB (+)
   ↓
2. Sheet abre com opções
   ↓
3. Clica em "Novo Orçamento"
   ↓
4. Navega para /dashboard/prontuario
   ↓
5. Usuário busca/seleciona paciente
   ↓
6. Acessa aba "Orçamentos" do paciente
   ↓
7. Clica em "Novo Orçamento" dentro da aba
```

---

## Benefícios

1. **Interface mais limpa**: Sem cards de métricas desnecessários
2. **Navegação estável**: Sem "balanço" horizontal
3. **Botões funcionais**: Todas as ações rápidas navegam corretamente
4. **Foco no essencial**: Ações rápidas e lista de agendamentos
5. **Performance**: Menos queries ao banco de dados
