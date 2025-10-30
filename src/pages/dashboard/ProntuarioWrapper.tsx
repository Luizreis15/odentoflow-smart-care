import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import Prontuario from "./Prontuario";

const ProntuarioWrapper = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is super admin
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Super admins can access without clinic
      if (userRole) {
        setProfile(profileData);
        setLoading(false);
        return;
      }

      if (!profileData?.clinic_id) {
        navigate("/onboarding/welcome");
        return;
      }

      // Check if onboarding is completed
      const { data: clinicData } = await supabase
        .from("clinicas")
        .select("onboarding_status")
        .eq("id", profileData.clinic_id)
        .single();

      if (clinicData?.onboarding_status !== "completed") {
        navigate("/onboarding/welcome");
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) return null;

  return (
    <DashboardLayout user={profile}>
      <Prontuario />
    </DashboardLayout>
  );
};

export default ProntuarioWrapper;