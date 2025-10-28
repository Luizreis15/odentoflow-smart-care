import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Perfil from "./Perfil";
import { supabase } from "@/integrations/supabase/client";

const PerfilWrapper = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData?.clinic_id) {
        navigate("/onboarding");
        return;
      }

      const { data: clinicaData } = await supabase
        .from("clinicas")
        .select("*")
        .eq("id", profileData.clinic_id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error("Erro na autenticação:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <DashboardLayout user={profile}>
      <Perfil />
    </DashboardLayout>
  );
};

export default PerfilWrapper;
