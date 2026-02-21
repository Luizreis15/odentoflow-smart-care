import { useNavigate } from "react-router-dom";
import { CalendarPlus, Search, DollarSign, FileText } from "lucide-react";

interface MobileQuickActionsProps {
  clinicId: string;
}

const MobileQuickActions = ({ clinicId }: MobileQuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: CalendarPlus,
      label: "Agendar",
      colorClass: "text-[hsl(var(--flowdent-blue))]",
      bgClass: "bg-[hsl(var(--card-blue))]",
      onClick: () => navigate("/dashboard/agenda"),
    },
    {
      icon: Search,
      label: "Pacientes",
      colorClass: "text-[hsl(var(--flow-turquoise))]",
      bgClass: "bg-[hsl(var(--card-turquoise))]",
      onClick: () => navigate("/dashboard/prontuario"),
    },
    {
      icon: DollarSign,
      label: "Financeiro",
      colorClass: "text-[hsl(var(--success-green))]",
      bgClass: "bg-[hsl(var(--card-green))]",
      onClick: () => navigate("/dashboard/financeiro"),
    },
    {
      icon: FileText,
      label: "Prontuário",
      colorClass: "text-[hsl(var(--health-mint))]",
      bgClass: "bg-[hsl(var(--card-mint))]",
      onClick: () => navigate("/dashboard/prontuario"),
    },
  ];

  return (
    <div className="px-4 w-full max-w-full overflow-hidden mb-5">
      <h2 className="text-label text-muted-foreground mb-2">
        Ações Rápidas
      </h2>
      <div className="grid grid-cols-4 gap-2 w-full">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 rounded-card press-scale ${action.bgClass} shadow-sm min-h-[72px]`}
          >
            <div className={`p-2 rounded-btn bg-white/70 ${action.colorClass}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileQuickActions;
