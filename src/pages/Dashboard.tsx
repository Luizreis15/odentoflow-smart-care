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
  clinic_id: string;
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

  return (
    <DashboardLayout user={profile}>
      {!isSuperAdmin && status === "trialing" && trialEnd && (
        <TrialBanner 
          daysLeft={Math.ceil((new Date(trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 
        />
      )}
      
      {isSuperAdmin ? (
        <h1 className="text-lg font-bold mb-4">Painel Super Admin</h1>
      ) : (
        <h1 className="text-lg lg:text-xl font-bold mb-4">Bem-vindo, {profile?.full_name?.split(' ')[0] || "Usuário"}!</h1>
      )}

        {!isSuperAdmin && profile?.clinic_id && (
          <div className="space-y-4">
            {/* Métricas - Grid responsivo */}
            <DashboardMetrics clinicId={profile.clinic_id} />
            
            {/* Quick Actions - Scroll horizontal no mobile */}
            <div className="lg:hidden">
              <QuickActions />
            </div>

            {/* Layout Desktop com sidebars */}
            <div className="flex gap-6">
              <aside className="hidden xl:block w-80 flex-shrink-0">
                <SidebarFilters clinicId={profile.clinic_id} />
              </aside>

              <main className="flex-1 min-w-0 space-y-4">
                <AgendaCalendar clinicId={profile.clinic_id} />
                
                {/* Próximos agendamentos no mobile */}
                <div className="lg:hidden">
                  <UpcomingAppointments clinicId={profile.clinic_id} />
                </div>
              </main>

              <aside className="hidden lg:block w-80 flex-shrink-0 space-y-4">
                <QuickActions />
                <UpcomingAppointments clinicId={profile.clinic_id} />
              </aside>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
};

export default Dashboard;