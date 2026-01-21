import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import TrialBanner from "@/components/TrialBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { ModuleCards } from "@/components/dashboard/ModuleCards";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileHome from "@/pages/mobile/MobileHome";
import { User, LogOut, Settings, CreditCard, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import logoFlowdent from '@/assets/logo-flowdent.png';

interface Profile {
  full_name: string;
  email: string;
  clinic_id: string;
}

interface ImpersonationState {
  clinicId: string;
  clinicName: string;
  startedAt: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeClinicId, setActiveClinicId] = useState<string | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const { status, trialEnd } = useSubscription();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("[DASHBOARD] Starting auth check");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("[DASHBOARD] No session, redirecting to auth");
        navigate("/auth");
        return;
      }

      console.log("[DASHBOARD] Session found:", session.user.email);
      setUser(session.user);

      // Check for impersonation data in URL (cross-domain transfer)
      const searchParams = new URLSearchParams(window.location.search);
      const impersonateParam = searchParams.get("impersonate");
      
      if (impersonateParam) {
        try {
          const impersonationData: ImpersonationState = JSON.parse(decodeURIComponent(impersonateParam));
          console.log("[DASHBOARD] Received impersonation via URL:", impersonationData.clinicName);
          
          // Validate user is super admin before accepting impersonation
          const { data: userRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "super_admin")
            .maybeSingle();
          
          if (userRole) {
            // Store in localStorage for this domain
            localStorage.setItem("admin_impersonation", JSON.stringify(impersonationData));
            console.log("[DASHBOARD] Impersonation data saved to localStorage");
          } else {
            console.warn("[DASHBOARD] Non-admin tried to impersonate, rejecting");
          }
          
          // Clean URL
          window.history.replaceState({}, "", "/dashboard");
        } catch (e) {
          console.error("[DASHBOARD] Error parsing impersonation data:", e);
          window.history.replaceState({}, "", "/dashboard");
        }
      }

      // Check for impersonation in localStorage
      const storedImpersonation = localStorage.getItem("admin_impersonation");
      if (storedImpersonation) {
        const impersonation: ImpersonationState = JSON.parse(storedImpersonation);
        console.log("[DASHBOARD] Impersonation active:", impersonation.clinicName);
        setActiveClinicId(impersonation.clinicId);
        setIsImpersonating(true);
        
        // Get profile for display
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        setProfile(profileData);
        setIsSuperAdmin(true);
        setLoading(false);
        return;
      }

      // Check if user is super admin
      console.log("[DASHBOARD] Checking super admin role");
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      console.log("[DASHBOARD] User role:", userRole);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      console.log("[DASHBOARD] Profile data:", profileData);

      // Super admins can access without clinic
      if (userRole) {
        console.log("[DASHBOARD] Super admin detected, granting access");
        setProfile(profileData);
        setIsSuperAdmin(true);
        setActiveClinicId(profileData?.clinic_id || null);
        setLoading(false);
        return;
      }

      // Check if user has completed onboarding
      if (!profileData?.clinic_id) {
        console.log("[DASHBOARD] No clinic_id, redirecting to onboarding");
        navigate("/onboarding/welcome");
        return;
      }

      console.log("[DASHBOARD] Checking clinic onboarding status");
      // Check if onboarding is completed
      const { data: clinicData } = await supabase
        .from("clinicas")
        .select("onboarding_status")
        .eq("id", profileData.clinic_id)
        .single();

      console.log("[DASHBOARD] Clinic data:", clinicData);

      if (clinicData?.onboarding_status !== "completed") {
        console.log("[DASHBOARD] Onboarding not completed, redirecting");
        navigate("/onboarding/welcome");
        return;
      }

      console.log("[DASHBOARD] All checks passed, setting profile and loading false");
      setProfile(profileData);
      setActiveClinicId(profileData.clinic_id);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        // Use setTimeout to defer Supabase calls and prevent deadlocks
        setTimeout(async () => {
          try {
            // Check if user is super admin
            const { data: userRole } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", "super_admin")
              .maybeSingle();

            // Super admins can access without clinic
            if (userRole) {
              return;
            }

            const { data: profileData } = await supabase
              .from("profiles")
              .select("clinic_id")
              .eq("id", session.user.id)
              .single();

            if (!profileData?.clinic_id) {
              navigate("/onboarding/welcome");
            } else {
              // Check if onboarding is completed
              const { data: clinicData } = await supabase
                .from("clinicas")
                .select("onboarding_status")
                .eq("id", profileData.clinic_id)
                .single();

              if (clinicData?.onboarding_status !== "completed") {
                navigate("/onboarding/welcome");
              }
            }
          } catch (error) {
            console.error("Error checking user data:", error);
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout user={profile}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 md:h-32" />
            ))}
          </div>
          <Skeleton className="h-[300px] md:h-[400px]" />
        </div>
      </DashboardLayout>
    );
  }

  // Mobile Home - simplified view
  if (isMobile && activeClinicId) {
    return (
      <DashboardLayout user={profile}>
        {!isSuperAdmin && status === "trialing" && trialEnd && (
          <TrialBanner 
            daysLeft={Math.ceil((new Date(trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 
          />
        )}
        <MobileHome user={profile} clinicId={activeClinicId} />
      </DashboardLayout>
    );
  }

  // Função para saudação baseada na hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const firstName = profile?.full_name?.split(' ')[0] || "Usuário";

  return (
    <DashboardLayout user={profile}>
      {!isSuperAdmin && status === "trialing" && trialEnd && (
        <TrialBanner 
          daysLeft={Math.ceil((new Date(trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 
        />
      )}
      
      {/* Header Desktop - Estilo Clinicorp */}
      <div className="hidden lg:block bg-card border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Flowdent */}
            <div className="flex items-center gap-3">
              <img src={logoFlowdent} alt="Flowdent" className="h-12 w-auto" />
            </div>
            
            {/* Barra de Busca Central */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar pacientes, consultas ou funções..."
                  className="pl-10 bg-muted/50 border-border focus:bg-background"
                />
              </div>
            </div>
            
            {/* Data + Perfil */}
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--flowdent-blue))] flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">{profile?.full_name || "Usuário"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/dashboard/perfil")} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/assinatura")} className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Assinatura
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      toast.success("Logout realizado com sucesso!");
                      navigate("/auth");
                    }} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Saudação */}
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">
            {isSuperAdmin 
              ? "Painel Super Admin" 
              : `Olá, ${firstName}! ${getGreeting()}!`
            }
          </h1>
          {!isSuperAdmin && (
            <p className="text-sm text-muted-foreground mt-1">
              Escolha um módulo para começar ou confira o resumo do dia.
            </p>
          )}
        </div>

        {activeClinicId && (
          <>
            {/* Cards de Módulos - Estilo Clinicorp */}
            <ModuleCards />
            
            {/* Resumo do Dia */}
            <div className="pt-4 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">📊 Resumo do Dia</h2>
              <DashboardMetrics clinicId={activeClinicId} />
            </div>
            
            {/* Próximos Agendamentos */}
            <div className="lg:max-w-2xl">
              <UpcomingAppointments clinicId={activeClinicId} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;