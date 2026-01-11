import { useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  Search,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
      label: "Buscar",
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
      icon: CheckCircle,
      label: "Confirmar",
      gradient: "bg-gradient-to-br from-[hsl(192,100%,42%)] to-[hsl(192,100%,35%)]",
      shadowColor: "shadow-[hsl(192,100%,42%)/25]",
      onClick: () => navigate("/dashboard/agenda"),
    },
  ];

  return (
    <div className="mx-4 overflow-hidden" style={{ width: 'calc(100vw - 32px)' }}>
      <h2 className="text-sm font-semibold text-foreground/70 mb-3 uppercase tracking-wide">
        Ações Rápidas
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            className={`w-full min-w-0 h-14 flex-col gap-1 text-white font-medium rounded-xl border-none transition-all hover:scale-[1.02] active:scale-[0.98] ${action.gradient} shadow-lg ${action.shadowColor}`}
          >
            <div className="p-1 rounded-lg bg-white/20 backdrop-blur-sm">
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-xs truncate max-w-full px-1">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileQuickActions;
