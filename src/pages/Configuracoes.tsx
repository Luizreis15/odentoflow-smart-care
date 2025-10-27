import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { ProfissionaisTab } from "@/components/configuracoes/ProfissionaisTab";
import { UsuariosTab } from "@/components/configuracoes/UsuariosTab";

const Configuracoes = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [clinica, setClinica] = useState<any>(null);
  const { isAdmin, loading: permissionsLoading } = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
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
        navigate("/onboarding/welcome");
        return;
      }

      setProfile(profileData);

      const { data: clinicData } = await supabase
        .from("clinicas")
        .select("*")
        .eq("id", profileData.clinic_id)
        .single();

      setClinica(clinicData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    if (!permissionsLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, permissionsLoading, navigate]);

  if (permissionsLoading || !profile) {
    return (
      <DashboardLayout user={profile}>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie profissionais, usuários e permissões da clínica
          </p>
        </div>

        {clinica && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>{clinica.nome}</strong> • Plano: {clinica.plano} • Status: {clinica.status_assinatura}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profissionais" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários & Permissões</TabsTrigger>
            <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="profissionais">
            <ProfissionaisTab clinicaId={profile.clinic_id} />
          </TabsContent>

          <TabsContent value="usuarios">
            <UsuariosTab clinicaId={profile.clinic_id} />
          </TabsContent>

          <TabsContent value="faturamento">
            <div className="text-center py-12 text-muted-foreground">
              Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="integracoes">
            <div className="text-center py-12 text-muted-foreground">
              Em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
