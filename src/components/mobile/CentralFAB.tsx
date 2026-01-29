import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CalendarPlus, UserPlus, DollarSign, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const CentralFAB = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: CalendarPlus,
      label: "Novo Agendamento",
      description: "Agendar consulta ou procedimento",
      color: "text-primary",
      bgColor: "bg-primary/10",
      onClick: () => {
        navigate("/dashboard/agenda");
        setOpen(false);
      },
    },
    {
      icon: UserPlus,
      label: "Novo Paciente",
      description: "Cadastrar um novo paciente",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      onClick: () => {
        navigate("/dashboard/prontuario");
        setOpen(false);
      },
    },
    {
      icon: DollarSign,
      label: "Receber Pagamento",
      description: "Registrar recebimento",
      color: "text-green-600",
      bgColor: "bg-green-600/10",
      onClick: () => {
        navigate("/dashboard/financeiro");
        setOpen(false);
      },
    },
    {
      icon: ClipboardList,
      label: "Novo Orçamento",
      description: "Criar orçamento para paciente",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      onClick: () => {
        navigate("/dashboard/prontuario");
        setOpen(false);
      },
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "relative -top-6 flex items-center justify-center",
            "h-14 w-14 rounded-full",
            "bg-primary text-primary-foreground",
            "shadow-lg shadow-primary/30",
            "transition-all duration-200",
            "active:scale-95",
            open && "rotate-45"
          )}
        >
          <Plus className="h-7 w-7 transition-transform duration-200" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8">
        <SheetHeader className="pb-4">
          <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mb-4" />
          <SheetTitle className="text-center">Ações Rápidas</SheetTitle>
        </SheetHeader>
        <div className="space-y-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-16 px-4 hover:bg-accent/50"
              onClick={action.onClick}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center mr-4",
                  action.bgColor
                )}
              >
                <action.icon className={cn("h-5 w-5", action.color)} />
              </div>
              <div className="text-left">
                <p className="font-medium">{action.label}</p>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CentralFAB;
