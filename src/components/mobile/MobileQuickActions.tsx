import { useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  Search,
  DollarSign,
  ClipboardList,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface MobileQuickActionsProps {
  clinicId: string;
}

const MobileQuickActions = ({ clinicId }: MobileQuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: CalendarPlus,
      label: "Agendar",
      gradient: "bg-gradient-to-br from-[hsl(205,84%,35%)] to-[hsl(205,84%,25%)]",
      shadowColor: "shadow-[hsl(205,84%,29%)/25]",
      onClick: () => navigate("/dashboard/agenda"),
    },
    {
      icon: Search,
      label: "Buscar Paciente",
      gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      shadowColor: "shadow-emerald-500/25",
      onClick: () => navigate("/dashboard/prontuario"),
    },
    {
      icon: DollarSign,
      label: "Receber",
      gradient: "bg-gradient-to-br from-green-500 to-green-600",
      shadowColor: "shadow-green-500/25",
      onClick: () => navigate("/dashboard/financeiro"),
    },
    {
      icon: ClipboardList,
      label: "Orçamento",
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
      shadowColor: "shadow-orange-500/25",
      onClick: () =>
        toast({
          title: "Em breve",
          description: "Novo orçamento rápido chegando em breve!",
        }),
    },
    {
      icon: CheckCircle,
      label: "Confirmar",
      gradient: "bg-gradient-to-br from-[hsl(192,100%,42%)] to-[hsl(192,100%,35%)]",
      shadowColor: "shadow-[hsl(192,100%,42%)/25]",
      onClick: () => navigate("/dashboard/agenda"),
    },
    {
      icon: MessageCircle,
      label: "Mensagem",
      gradient: "bg-gradient-to-br from-[#25D366] to-[#128C7E]",
      shadowColor: "shadow-[#25D366]/25",
      onClick: () => navigate("/dashboard/crm"),
    },
  ];

  return (
    <div className="px-4">
      <h2 className="text-sm font-semibold text-foreground/70 mb-3 uppercase tracking-wide">
        Ações Rápidas
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            className={`h-20 flex-col gap-2 text-white font-medium rounded-xl border-none transition-all hover:scale-[1.02] active:scale-[0.98] ${action.gradient} shadow-lg ${action.shadowColor}`}
          >
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileQuickActions;
