

## Plano: Corrigir race condition no botão "Novo Agendamento" mobile

### Problema raiz
Race condition entre `AgendaWrapper` e `Agenda`:
- `AgendaWrapper` usa `searchParams.get("new")` para decidir se renderiza `Agenda` ou `MobileAgenda`
- `Agenda` limpa o `?new=true` da URL no `useEffect`
- Isso causa re-render no `AgendaWrapper`, que volta para `MobileAgenda`, destruindo o `Agenda` antes do sheet abrir

### Solução
**Em `AgendaWrapper.tsx`**: usar `useState` para "travar" a decisão de renderizar o desktop Agenda quando `?new=true` foi detectado. Uma vez que o componente decide renderizar `Agenda`, ele mantém essa decisão mesmo após o parâmetro ser limpo da URL.

```tsx
const [forceDesktopAgenda, setForceDesktopAgenda] = useState(false);

useEffect(() => {
  if (isNewAppointment) {
    setForceDesktopAgenda(true);
  }
}, [isNewAppointment]);

// Renderizar MobileAgenda apenas se mobile, tem clinicId, e NÃO está criando agendamento
if (isMobile && clinicId && !isNewAppointment && !forceDesktopAgenda) {
  return <MobileAgenda />;
}
```

### Arquivo alterado
- `src/pages/dashboard/AgendaWrapper.tsx` — adicionar state para preservar decisão de roteamento

