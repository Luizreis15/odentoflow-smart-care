import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  FileText,
  DollarSign,
  MessageSquare,
  Users,
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  Settings,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";

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
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    description: "Profissionais e usuários",
  },
];

const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="flex">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-20 z-50 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 transform border-r bg-card transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "top-16"
          )}
        >
          <ScrollArea className="h-[calc(100vh-4rem)] py-6">
            <nav className="space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-3 py-3 transition-all hover:bg-accent",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-0 p-6 lg:p-8 pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;