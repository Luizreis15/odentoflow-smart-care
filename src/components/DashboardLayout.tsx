import { ReactNode, useState, useEffect, useRef } from "react";
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
  SmilePlus,
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
    name: "Ortodontia",
    href: "/dashboard/ortodontia",
    icon: SmilePlus,
    description: "Casos ortodônticos",
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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isSuperAdmin } = usePermissions();
  const [impersonation, setImpersonation] = useState<ImpersonationState | null>(null);
  
  // Check if we're on the dashboard home page (MobileHome has its own header)
  const isHomePage = location.pathname === "/dashboard";

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setSidebarExpanded(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setSidebarExpanded(false);
    }, 150);
  };

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

      {/* Mobile Navbar - hidden on home page since MobileHome has its own hero header */}
      {!isHomePage && (
        <div className="lg:hidden">
          <Navbar user={user} />
        </div>
      )}
      
      <div className={cn(
        "flex", 
        impersonation ? "lg:pt-[44px]" : "lg:pt-0",
        // Mobile: no padding on home (fullscreen hero), with padding on other pages
        isHomePage ? "pt-0" : (impersonation ? "pt-[104px]" : "pt-16")
      )}>
        {/* Sidebar retrátil no desktop - expande ao passar mouse */}
        <TooltipProvider delayDuration={0}>
          <aside
            className={cn(
              "hidden lg:flex fixed left-0 top-0 bottom-0 z-40 border-r",
              "transition-[width] duration-200 ease-in-out will-change-[width]",
              "bg-[hsl(var(--sidebar-background))]",
              sidebarExpanded ? "w-64" : "w-16"
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <ScrollArea className="w-full py-4">
              <nav className="space-y-1 px-2">
                {isSuperAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/super-admin"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3 mb-2 transition-all",
                          "bg-gradient-to-r from-[hsl(var(--flowdent-blue))]/10 to-[hsl(var(--flow-turquoise))]/10",
                          "hover:from-[hsl(var(--flowdent-blue))]/20 hover:to-[hsl(var(--flow-turquoise))]/20",
                          "border border-[hsl(var(--flowdent-blue))]/20",
                          !sidebarExpanded && "justify-center"
                        )}
                      >
                        <Shield className="h-5 w-5 flex-shrink-0 text-[hsl(var(--flowdent-blue))]" />
                        <div className={cn(
                          "flex-1 min-w-0 transition-opacity duration-200 overflow-hidden",
                          sidebarExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                        )}>
                          <div className="font-medium text-sm text-[hsl(var(--flowdent-blue))] truncate whitespace-nowrap">Super Admin</div>
                        </div>
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
                            "flex items-center gap-3 rounded-lg px-3 py-3 transition-all group",
                            isActive
                              ? "bg-gradient-to-r from-[hsl(var(--flowdent-blue))]/15 to-[hsl(var(--flow-turquoise))]/10 text-[hsl(var(--flowdent-blue))] font-medium shadow-sm"
                              : "text-foreground/70 hover:bg-[hsl(var(--sidebar-accent))] hover:text-foreground",
                            !sidebarExpanded && "justify-center"
                          )}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 flex-shrink-0 transition-colors",
                            isActive ? "text-[hsl(var(--flowdent-blue))]" : "text-foreground/50 group-hover:text-[hsl(var(--flow-turquoise))]"
                          )} />
                          <div className={cn(
                            "flex-1 min-w-0 transition-opacity duration-200 overflow-hidden",
                            sidebarExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                          )}>
                            <div className="font-medium text-sm truncate whitespace-nowrap">{item.name}</div>
                          </div>
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
          "flex-1 transition-all duration-200",
          "lg:ml-16 lg:pt-2 lg:pb-4 pb-24"
        )}>
          <div className="w-full mx-auto min-h-0 overflow-y-auto overflow-x-hidden px-4 lg:px-6">
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