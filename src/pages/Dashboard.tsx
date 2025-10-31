import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import TrialBanner from "@/components/TrialBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { AgendaCalendar } from "@/components/dashboard/AgendaCalendar";
import { SidebarFilters } from "@/components/dashboard/SidebarFilters";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";

interface Profile {
  full_name: string;
  email: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
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
        <div className="flex gap-6">
          <div className="w-80">
            <Skeleton className="h-[400px]" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-[500px]" />
          </div>
          <div className="w-80">
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={profile}>
      {!isSuperAdmin && status === "trialing" && trialEnd && (
        <TrialBanner 
          daysLeft={Math.ceil((new Date(trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 
        />
      )}
      
      {isSuperAdmin ? (
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
            Painel Super Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Acesso completo ao sistema. Use o menu lateral para navegar.
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
            Bem-vindo, {profile?.full_name || "Usuário"}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Aqui está um resumo da sua clínica hoje.
          </p>
        </div>
      )}

        {!isSuperAdmin && (
          <div className="flex gap-4 lg:gap-6">
            {/* Sidebar Esquerda - Filtros e Calendário */}
            <aside className="hidden xl:block w-64 flex-shrink-0">
              <SidebarFilters />
            </aside>

            {/* Área Central - Métricas e Agenda */}
            <main className="flex-1 min-w-0">
              <DashboardMetrics />
              <div className="mt-6">
                <AgendaCalendar />
              </div>
            </main>

            {/* Sidebar Direita - Ações e Próximas Consultas */}
            <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 space-y-4">
              <QuickActions />
              <UpcomingAppointments />
            </aside>
          </div>
        )}
    </DashboardLayout>
  );
};

export default Dashboard;