import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import { usePermissions } from "@/hooks/usePermissions";

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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { isSuperAdmin } = usePermissions();

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="flex pt-16">
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
          "lg:ml-16 p-2 lg:p-3"
        )}>
          <div className="w-full mx-auto max-h-[calc(100vh-4rem)] overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;