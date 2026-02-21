import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, LayoutDashboard, Users, Building2, UserPlus, Mail, CreditCard, Settings, FileText, LogOut, Shield, ChevronLeft, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImpersonationState {
  clinicId: string;
  clinicName: string;
  startedAt: string;
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [impersonation, setImpersonation] = useState<ImpersonationState | null>(null);

  useEffect(() => {
    checkAdminAccess();
    loadImpersonationState();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin");
        return;
      }

      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      if (!userRole) {
        toast.error("Acesso negado");
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name);
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const loadImpersonationState = () => {
    const stored = localStorage.getItem("admin_impersonation");
    if (stored) {
      setImpersonation(JSON.parse(stored));
    }
  };

  const handleEndImpersonation = async () => {
    const stored = localStorage.getItem("admin_impersonation");
    if (stored) {
      const state = JSON.parse(stored) as ImpersonationState;
      
      // Log end of impersonation
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
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("admin_impersonation");
    navigate("/admin");
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Painel", icon: LayoutDashboard },
    { path: "/admin/users", label: "Usuários", icon: Users },
    { path: "/admin/clinics", label: "Clínicas", icon: Building2 },
    { path: "/admin/leads", label: "Leads", icon: UserPlus },
    { path: "/admin/marketing", label: "Marketing", icon: Mail },
    { path: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard },
    { path: "/admin/modules", label: "Módulos", icon: Settings },
    { path: "/admin/audit", label: "Auditoria", icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Impersonation Banner */}
      {impersonation && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="font-medium">
              Visualizando como: {impersonation.clinicName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-amber-400 border-amber-600 hover:bg-amber-300"
              onClick={() => navigate("/dashboard")}
            >
              Ir para o sistema
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-amber-400"
              onClick={handleEndImpersonation}
            >
              <X className="h-4 w-4 mr-1" />
              Encerrar
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        impersonation && "mt-10"
      )}>
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-white">Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-400 hover:text-white hover:bg-slate-700",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-slate-700">
          {!collapsed && (
            <div className="mb-3">
              <p className="text-xs text-slate-500">Logado como</p>
              <p className="text-sm text-white truncate">{userName}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={handleLogout}
            className={cn(
              "text-slate-400 hover:text-white hover:bg-slate-700",
              !collapsed && "w-full justify-start"
            )}
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-auto",
        impersonation && "mt-10"
      )}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
