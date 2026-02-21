import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import TrialBanner from "@/components/TrialBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { ModuleCards } from "@/components/dashboard/ModuleCards";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { DashboardAgendaTable } from "@/components/dashboard/DashboardAgendaTable";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileHome from "@/pages/mobile/MobileHome";
import { toast } from "sonner";

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
      
      {/* Conteúdo Principal */}
      <div className="space-y-6">
        {/* Saudação */}
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
            {isSuperAdmin 
              ? "Painel Super Admin" 
              : `${getGreeting()}, ${firstName}`
            }
          </h1>
          {!isSuperAdmin && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Confira o resumo do dia da sua clínica.
            </p>
          )}
        </div>

        {activeClinicId && (
          <>
            {/* Linha 1: KPIs */}
            <DashboardMetrics clinicId={activeClinicId} />

            {/* Linha 2: Agenda do dia (desktop) / Module Cards (mobile kept via MobileHome) */}
            <div className="hidden lg:block">
              <DashboardAgendaTable clinicId={activeClinicId} />
            </div>

            {/* Mobile: Module Cards (still useful for quick nav on mobile web fallback) */}
            <div className="lg:hidden">
              <ModuleCards />
            </div>
            
            {/* Linha 3: Alertas operacionais */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                Alertas Operacionais
              </h2>
              <DashboardAlerts clinicId={activeClinicId} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;