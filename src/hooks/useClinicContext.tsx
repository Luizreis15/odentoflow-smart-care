import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImpersonationState {
  clinicId: string;
  clinicName: string;
  startedAt: string;
}

interface ClinicContext {
  clinicId: string | null;
  clinicName: string | null;
  isImpersonating: boolean;
  isLoading: boolean;
  endImpersonation: () => Promise<void>;
}

export const useClinicContext = (): ClinicContext => {
  const navigate = useNavigate();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState<string | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClinicContext();
  }, []);

  const loadClinicContext = async () => {
    try {
      // Check for impersonation first
      const storedImpersonation = localStorage.getItem("admin_impersonation");
      
      if (storedImpersonation) {
        const impersonation: ImpersonationState = JSON.parse(storedImpersonation);
        setClinicId(impersonation.clinicId);
        setClinicName(impersonation.clinicName);
        setIsImpersonating(true);
        setIsLoading(false);
        return;
      }

      // No impersonation, get user's actual clinic
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (profile?.clinic_id) {
        setClinicId(profile.clinic_id);

        // Get clinic name
        const { data: clinic } = await supabase
          .from("clinicas")
          .select("nome")
          .eq("id", profile.clinic_id)
          .single();

        if (clinic) {
          setClinicName(clinic.nome);
        }
      }
    } catch (error) {
      console.error("Error loading clinic context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const endImpersonation = useCallback(async () => {
    const storedImpersonation = localStorage.getItem("admin_impersonation");
    
    if (storedImpersonation) {
      const impersonation: ImpersonationState = JSON.parse(storedImpersonation);
      
      // Log end of impersonation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_impersonation_logs").update({
          ended_at: new Date().toISOString()
        }).match({
          admin_user_id: user.id,
          impersonated_clinic_id: impersonation.clinicId,
          ended_at: null
        });
      }
    }
    
    localStorage.removeItem("admin_impersonation");
    setIsImpersonating(false);
    setClinicId(null);
    setClinicName(null);
    toast.success("Impersonação encerrada");
    navigate("/admin/clinics");
  }, [navigate]);

  return {
    clinicId,
    clinicName,
    isImpersonating,
    isLoading,
    endImpersonation,
  };
};
