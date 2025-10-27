import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import Agenda from "./Agenda";

const AgendaWrapper = () => {
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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!profileData?.clinic_id) {
        navigate("/onboarding");
        return;
      }

      // Check if clinic has at least one professional
      const { data: professionals, error } = await supabase
        .from("profissionais")
        .select("id")
        .eq("clinica_id", profileData.clinic_id)
        .limit(1);

      if (error) {
        console.error("Erro ao verificar profissionais:", error);
      }

      if (!professionals || professionals.length === 0) {
        navigate("/onboarding");
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
      <Agenda />
    </DashboardLayout>
  );
};

export default AgendaWrapper;