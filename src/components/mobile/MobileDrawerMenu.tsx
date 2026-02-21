import { Link, useNavigate, useLocation } from "react-router-dom";
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
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Organized menu categories
const menuCategories = [
  {
    title: "PRINCIPAIS",
    items: [
      { name: "Painel", href: "/dashboard", icon: LayoutDashboard },
      { name: "Agenda", href: "/dashboard/agenda", icon: Calendar },
      { name: "Prontuário", href: "/dashboard/prontuario", icon: FileText },
    ],
  },
  {
    title: "GESTÃO",
    items: [
      { name: "Financeiro", href: "/dashboard/financeiro", icon: DollarSign },
      { name: "CRM", href: "/dashboard/crm", icon: MessageSquare },
      { name: "Estoque", href: "/dashboard/estoque", icon: Package },
    ],
  },
  {
    title: "OUTROS",
    items: [
      { name: "Próteses", href: "/dashboard/proteses", icon: FlaskConical },
      { name: "Portal Paciente", href: "/dashboard/portal-paciente", icon: Users },
      { name: "IA Assistente", href: "/dashboard/ia-assistente", icon: Sparkles },
      { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
      { name: "Perfil", href: "/dashboard/profile", icon: User },
    ],
  },
];

interface MobileDrawerMenuProps {
  user?: {
    email?: string;
    full_name?: string;
  } | null;
  onClose: () => void;
}

const MobileDrawerMenu = ({ user, onClose }: MobileDrawerMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isSuperAdmin } = usePermissions();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
      onClose();
      navigate("/");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com usuário */}
      <div className="p-4 bg-primary/5">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials(user?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {user?.full_name || "Usuário"}
            </p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Menu items organized by category */}
      <ScrollArea className="flex-1">
        <nav className="py-2">
          {isSuperAdmin && (
            <div className="px-2 mb-2">
              <Link
                to="/super-admin"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Super Admin</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Link>
            </div>
          )}

          {menuCategories.map((category, categoryIndex) => (
            <div key={category.title} className="mb-2">
              {/* Category title */}
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-muted-foreground tracking-wider">
                  {category.title}
                </span>
              </div>

              {/* Category items */}
              <div className="px-2 space-y-0.5">
                {category.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        isActive
                          ? "bg-accent text-primary font-medium"
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="text-sm">{item.name}</span>
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>

              {/* Separator between categories */}
              {categoryIndex < menuCategories.length - 1 && (
                <Separator className="mt-2" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Logout */}
      <div className="p-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default MobileDrawerMenu;
