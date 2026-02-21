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
    <div className="px-4 w-full max-w-full overflow-hidden">
      <h2 className="text-sm font-semibold text-foreground/70 mb-3 uppercase tracking-wide">
        Ações Rápidas
      </h2>
      <div className="grid grid-cols-2 gap-3 w-full">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full h-14 flex flex-col items-center justify-center gap-1 text-white font-medium rounded-xl border-none transition-transform active:scale-[0.97] ${action.gradient} shadow-lg`}
          >
            <div className="p-1 rounded-lg bg-white/20">
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-xs">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileQuickActions;
