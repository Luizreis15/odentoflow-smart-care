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
      color: "bg-primary hover:bg-primary/90",
      onClick: () => navigate("/dashboard/agenda"),
    },
    {
      icon: Search,
      label: "Buscar Paciente",
      color: "bg-emerald-500 hover:bg-emerald-600",
      onClick: () => navigate("/dashboard/prontuario"),
    },
    {
      icon: DollarSign,
      label: "Receber",
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => navigate("/dashboard/financeiro"),
    },
    {
      icon: ClipboardList,
      label: "Orçamento",
      color: "bg-orange-500 hover:bg-orange-600",
      onClick: () =>
        toast({
          title: "Em breve",
          description: "Novo orçamento rápido chegando em breve!",
        }),
    },
    {
      icon: CheckCircle,
      label: "Confirmar",
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => navigate("/dashboard/agenda"),
    },
    {
      icon: MessageCircle,
      label: "Mensagem",
      color: "bg-[#25D366] hover:bg-[#20BD5A]",
      onClick: () => navigate("/dashboard/crm"),
    },
  ];

  return (
    <div className="px-4">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
        Ações Rápidas
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            className={`h-20 flex-col gap-2 text-white font-medium shadow-md rounded-xl ${action.color}`}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileQuickActions;
