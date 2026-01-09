import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  DollarSign,
  MessageSquare,
  Users,
  Sparkles,
  LayoutDashboard,
  Settings,
  FlaskConical,
  Package,
  User,
  Shield,
  Eye,
  X,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import MobileBottomNav from "./mobile/MobileBottomNav";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImpersonationState {
  clinicId: string;
  clinicName: string;
  startedAt: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    email?: string;
    full_name?: string;
  } | null;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Agenda",
    href: "/dashboard/agenda",
    icon: Calendar,
    description: "Agendamentos e horários",
  },
  {
    name: "Prontuário",
    href: "/dashboard/prontuario",
    icon: FileText,
    description: "Histórico dos pacientes",
  },
  {
    name: "Financeiro",
    href: "/dashboard/financeiro",
    icon: DollarSign,
    description: "Receitas e despesas",
  },
  {
    name: "CRM",
    href: "/dashboard/crm",
    icon: MessageSquare,
    description: "Relacionamento automático",
  },
  {
    name: "Controle de Prótese",
    href: "/dashboard/proteses",
    icon: FlaskConical,
    description: "Gestão do fluxo protético",
  },
  {
    name: "Estoque",
    href: "/dashboard/estoque",
    icon: Package,
    description: "Controle de produtos",
    subItems: [
      {
        name: "Dashboard",
        href: "/dashboard/estoque",
      },
      {
        name: "Produtos",
        href: "/dashboard/produtos",
      },
      {
        name: "Movimentações",
        href: "/dashboard/movimentacoes",
      },
    ],
  },
  {
    name: "Portal do Paciente",
    href: "/dashboard/portal-paciente",
    icon: Users,
    description: "Área do paciente",
  },
  {
    name: "IA Assistente",
    href: "/dashboard/ia-assistente",
    icon: Sparkles,
    description: "Inteligência artificial",
  },
  {
    name: "Ajustes",
    href: "/dashboard/configuracoes",
    icon: Settings,
    description: "Configurações da clínica",
  },
  {
    name: "Perfil",
    href: "/dashboard/profile",
    icon: User,
    description: "Minha conta e preferências",
  },
];

const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { isSuperAdmin } = usePermissions();
  const [impersonation, setImpersonation] = useState<ImpersonationState | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin_impersonation");
    if (stored) {
      setImpersonation(JSON.parse(stored));
    }
  }, []);

  const handleEndImpersonation = async () => {
    const stored = localStorage.getItem("admin_impersonation");
    if (stored) {
      const state = JSON.parse(stored) as ImpersonationState;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_impersonation_logs").update({
          ended_at: new Date().toISOString()
        }).match({
          admin_user_id: user.id,
          impersonated_clinic_id: state.clinicId,
          ended_at: null
        });
      }
    }
    
    localStorage.removeItem("admin_impersonation");
    setImpersonation(null);
    toast.success("Impersonação encerrada");
    navigate("/admin/clinics");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Impersonation Banner */}
      {impersonation && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between z-[60]">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="font-medium text-sm md:text-base">
              Visualizando: {impersonation.clinicName}
            </span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-amber-400 border-amber-600 hover:bg-amber-300 text-amber-950 text-xs md:text-sm"
              onClick={() => navigate("/admin/clinics")}
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden md:inline">Voltar ao Admin</span>
              <span className="md:hidden">Admin</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-amber-400 text-amber-950"
              onClick={handleEndImpersonation}
            >
              <X className="h-4 w-4" />
              <span className="hidden md:inline ml-1">Encerrar</span>
            </Button>
          </div>
        </div>
      )}

      <Navbar user={user} />
      
      <div className={cn("flex", impersonation ? "pt-[104px]" : "pt-16")}>
        {/* Sidebar retrátil no desktop - expande ao passar mouse */}
        <TooltipProvider delayDuration={0}>
          <aside
            className={cn(
              "hidden lg:flex fixed left-0 top-16 bottom-0 z-40 border-r bg-card transition-all duration-150 ease-out",
              sidebarExpanded ? "w-64" : "w-16"
            )}
            onMouseEnter={() => setSidebarExpanded(true)}
            onMouseLeave={() => setSidebarExpanded(false)}
          >
            <ScrollArea className="w-full py-4">
              <nav className="space-y-1 px-2">
                {isSuperAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/super-admin"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3 mb-2 transition-all bg-primary/10 hover:bg-primary/20 border border-primary/20",
                          !sidebarExpanded && "justify-center"
                        )}
                      >
                        <Shield className="h-5 w-5 flex-shrink-0 text-primary" />
                        {sidebarExpanded && (
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-primary truncate">Super Admin</div>
                          </div>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {!sidebarExpanded && (
                      <TooltipContent side="right">
                        <p>Super Admin</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                )}
                
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:bg-accent group",
                            isActive
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground",
                            !sidebarExpanded && "justify-center"
                          )}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 flex-shrink-0 transition-colors",
                            isActive && "text-primary"
                          )} />
                          {sidebarExpanded && (
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{item.name}</div>
                            </div>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {!sidebarExpanded && (
                        <TooltipContent side="right">
                          <p>{item.name}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </nav>
            </ScrollArea>
          </aside>
        </TooltipProvider>

        {/* Main content com margem dinâmica baseada no sidebar */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          "lg:ml-16 p-3 lg:p-4 pb-20 lg:pb-4"
        )}>
          <div className="w-full mx-auto max-h-[calc(100vh-4rem)] overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav user={user} />
    </div>
  );
};

export default DashboardLayout;