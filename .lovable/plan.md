
# Plano: Redesign Mobile da Tela de Detalhes do Paciente

## Problemas Identificados na Análise

### 1. Header Desorganizado (IMG_8080.png)
- Avatar, nome e botoes empilhados verticalmente sem estrutura
- Telefone quebrado em 3 linhas ("11", "98361-", "2450")
- Botoes de acao empilhados verticalmente ocupando muito espaco
- Nome truncado sem indicador visual adequado

### 2. Tabs em Multiplas Linhas (IMG_8080.png)
- 9 tabs distribuidas em 3 linhas (Cadastro, Orcamentos, Financeiro / Odontograma, Tratamentos, Anamnese / Imagens, Documentos, Agendamentos)
- Nao eh scrollavel horizontalmente como apps nativos
- Ocupa muito espaco vertical

### 3. Dados Sem Estrutura Visual (IMG_8081.png, IMG_8082.png)
- Cards com campos empilhados sem separacao visual adequada
- Nao parece interface de app nativo
- Espacamento uniforme demais sem hierarquia visual
- Botao "Editar" pequeno e pouco visivel

### 4. Menu Lateral Inapropriado para Mobile
- O menu de secoes (Dados Cadastrais, Contato, Dados Complementares) aparece como menu lateral que nao funciona bem em telas pequenas

---

## Solucao: Design Mobile-First Inspirado em Apps Nativos

### Parte 1: Header Compacto e Profissional

**Antes:**
```
┌────────────────────────────┐
│ ←  [Avatar]  JONATHAN L... │
│    (545555)  [Ativo]       │
│    11                      │
│    98361-                  │
│    2450      Nao informado │
│                            │
│    [Editar]                │
│    [WhatsApp]              │
│    [Copiar Link]           │
│    [🖨️] [📤] [🗑️]          │
└────────────────────────────┘
```

**Depois:**
```
┌────────────────────────────┐
│ ← Jonathan Lessa    [Ativo]│
│                            │
│ [Avatar]  [Editar] [WhatsApp] [⋮] │
│ 📞 (11) 98361-2450         │
│ ✉️ email@email.com         │
└────────────────────────────┘
```

### Parte 2: Tabs Horizontais Scrollaveis

**Antes:** 3 linhas de tabs
**Depois:** 1 linha scrollavel com indicador visual

```
┌────────────────────────────┐
│ [Cadastro] [Orcamentos] [Financeiro] [Odonto...] → │
└────────────────────────────┘
```

### Parte 3: Campos de Dados em Grid Compacto

**Antes:** Lista simples empilhada
**Depois:** Grid 2x2 com cards visuais

```
┌────────────────────────────┐
│ Dados Cadastrais    [Edit] │
├────────────┬───────────────┤
│ Nome       │ Apelido       │
│ Jonathan   │ -             │
├────────────┼───────────────┤
│ Nascimento │ Idade         │
│ 15/03/1990 │ 35 anos       │
├────────────┼───────────────┤
│ Sexo       │ CPF           │
│ Masculino  │ 123.456.789-00│
└────────────┴───────────────┘
```

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/dashboard/PatientDetails.tsx` | Implementar layout responsivo mobile-first |

---

## Detalhes Tecnicos

### 1. Header Mobile Compacto

```typescript
{/* Mobile Header */}
<div className="lg:hidden bg-card rounded-xl border shadow-sm overflow-hidden">
  {/* Top bar com nome e status */}
  <div className="bg-gradient-to-r from-[hsl(var(--flowdent-blue))] to-[hsl(var(--flow-turquoise))] px-4 py-4 text-white">
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" className="text-white">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-lg truncate">
          {patient.full_name}
        </h1>
        <p className="text-white/80 text-sm">#{patientCode}</p>
      </div>
      <Badge className="bg-white/20 text-white">
        {isActive ? "Ativo" : "Inativo"}
      </Badge>
    </div>
  </div>
  
  {/* Avatar e acoes rapidas */}
  <div className="px-4 py-4">
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 border-4 border-white shadow-lg -mt-10">
        <AvatarFallback>J</AvatarFallback>
      </Avatar>
      <div className="flex-1 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          <Edit className="h-4 w-4 mr-1" /> Editar
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
        </Button>
        <Button size="icon" variant="outline">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
    
    {/* Contato inline */}
    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Phone className="h-4 w-4" />
        <span>{formatPhone(patient.phone)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Mail className="h-4 w-4" />
        <span className="truncate max-w-[150px]">{patient.email || "Nao informado"}</span>
      </div>
    </div>
  </div>
</div>
```

### 2. Tabs Horizontais Scrollaveis

```typescript
<TabsList className="w-full justify-start overflow-x-auto scrollbar-hide flex-nowrap h-12 px-2 bg-transparent gap-1">
  {["cadastro", "orcamentos", "financeiro", "odontograma", "tratamentos", "anamnese", "imagens", "documentos", "agendamentos"].map((tab) => (
    <TabsTrigger 
      key={tab}
      value={tab} 
      className="flex-shrink-0 rounded-full px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
    >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
    </TabsTrigger>
  ))}
</TabsList>
```

### 3. Grid de Dados Mobile

```typescript
{/* Grid 2 colunas no mobile */}
<div className="grid grid-cols-2 gap-3">
  <div className="bg-muted/30 rounded-lg p-3">
    <span className="text-xs text-muted-foreground block">Nome</span>
    <span className="font-medium text-sm">{patient.full_name}</span>
  </div>
  <div className="bg-muted/30 rounded-lg p-3">
    <span className="text-xs text-muted-foreground block">Apelido</span>
    <span className="font-medium text-sm">{patient.nickname || "-"}</span>
  </div>
  {/* ... mais campos */}
</div>
```

### 4. Menu de Secoes como Pills Horizontais

```typescript
{/* No mobile: pills horizontais em vez de menu lateral */}
<div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-2">
  {["dados", "contato", "complementares"].map((section) => (
    <button
      key={section}
      onClick={() => scrollToSection(section)}
      className={cn(
        "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
        activeSection === section
          ? "bg-primary text-white"
          : "bg-muted hover:bg-muted/80"
      )}
    >
      {section === "dados" ? "Dados" : section === "contato" ? "Contato" : "Complementares"}
    </button>
  ))}
</div>
```

---

## Resultado Visual Esperado

### Mobile (Antes)
```
┌─────────────────────┐
│ ← [J] JONATHAN L... │
│   (545555) [Ativo]  │
│   11 98361-         │
│   2450    Nao inf.  │
│                     │
│ [Editar          ]  │
│ [WhatsApp        ]  │
│ [Copiar Link     ]  │
│ [🖨️] [📤] [🗑️]     │
├─────────────────────┤
│ Cadastro|Orcamentos │
│ Financeiro|Odonto   │
│ Tratam|Anamnese|Img │
├─────────────────────┤
│ [Dados Cadastrais]  │
│ [Contato]           │
│ [Complementares]    │
├─────────────────────┤
│ Nome                │
│ Jonathan Lessa      │
│ Apelido             │
│ Nao informado       │
│ ...                 │
└─────────────────────┘
```

### Mobile (Depois)
```
┌─────────────────────────┐
│ ← Jonathan Lessa [Ativo]│  ← Header gradiente
│ #545555                 │
├─────────────────────────┤
│ [J] [Editar][WhatsApp][⋮]│  ← Avatar flutuante
│ 📞 (11) 98361-2450      │  ← Contato inline
│ ✉️ email@email.com      │
├─────────────────────────┤
│ [Cadastro][Orcam][Finan] →│ ← Tabs scroll
├─────────────────────────┤
│ [Dados][Contato][Compl] │  ← Pills subsecao
├───────────┬─────────────┤
│ Nome      │ Apelido     │  ← Grid 2x2
│ Jonathan  │ -           │
├───────────┼─────────────┤
│ Nascimento│ Idade       │
│ 15/03/90  │ 35 anos     │
└───────────┴─────────────┘
```

---

## Beneficios

1. **Visual de App Nativo**: Header com gradiente e avatar flutuante
2. **Navegacao Eficiente**: Tabs scrollaveis horizontalmente em 1 linha
3. **Hierarquia Visual**: Grid 2x2 para dados com background diferenciado
4. **Touch-Friendly**: Botoes com tamanho adequado (min 44px)
5. **Espaco Otimizado**: Menos scroll vertical, mais informacao visivel
6. **Consistencia**: Usa mesmos padroes de cores/gradientes do MobileHome
