import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, X, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImpersonationState {
  clinicId: string;
  clinicName: string;
  startedAt: string;
}

export default function ImpersonationBanner() {
  const navigate = useNavigate();
  const [impersonation, setImpersonation] = useState<ImpersonationState | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin_impersonation");
    if (stored) {
      setImpersonation(JSON.parse(stored));
    }

    // Listen for storage changes
    const handleStorage = () => {
      const updated = localStorage.getItem("admin_impersonation");
      setImpersonation(updated ? JSON.parse(updated) : null);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleEndImpersonation = async () => {
    const stored = localStorage.getItem("admin_impersonation");
    if (stored) {
      const state = JSON.parse(stored) as ImpersonationState;
      
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
    navigate("/super-admin/locatarios");
  };

  if (!impersonation) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between z-[60]">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span className="font-medium text-sm md:text-base">
          Impersonando: {impersonation.clinicName}
        </span>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-destructive/80 border-destructive-foreground/20 hover:bg-destructive/60 text-destructive-foreground text-xs md:text-sm"
          onClick={() => navigate("/super-admin/locatarios")}
        >
          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          <span className="hidden md:inline">Voltar ao Admin</span>
          <span className="md:hidden">Admin</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="hover:bg-destructive/60 text-destructive-foreground"
          onClick={handleEndImpersonation}
        >
          <X className="h-4 w-4" />
          <span className="hidden md:inline ml-1">Encerrar</span>
        </Button>
      </div>
    </div>
  );
}
