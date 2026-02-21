import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfissionaisTab } from "@/components/configuracoes/ProfissionaisTab";
import { UsuariosTab } from "@/components/configuracoes/UsuariosTab";
import { ProcedimentosTab } from "@/components/configuracoes/ProcedimentosTab";
import { ClinicaTab } from "@/components/configuracoes/ClinicaTab";
import { NotaFiscalTab } from "@/components/configuracoes/NotaFiscalTab";
import { CategoriasTab } from "@/components/configuracoes/CategoriasTab";
import { ContratosTab } from "@/components/configuracoes/ContratosTab";
import { CaixasTab } from "@/components/configuracoes/CaixasTab";
import { CadeirasTab } from "@/components/configuracoes/CadeirasTab";
import { LocaisEstoqueTab } from "@/components/configuracoes/LocaisEstoqueTab";
import { FornecedoresTab } from "@/components/configuracoes/FornecedoresTab";
import { DespesasTabV2 } from "@/components/configuracoes/DespesasTabV2";
import { RegrasComissaoTab } from "@/components/configuracoes/RegrasComissaoTab";

const Configuracoes = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [clinica, setClinica] = useState<any>(null);
  const { isAdmin, isSuperAdmin, isLoading: permissionsLoading } = useAuth();

  useEffect(() => {
    if (!permissionsLoading) {
      loadData();
    }
  }, [permissionsLoading, isSuperAdmin]);

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

      if (!profileData?.clinic_id && !isSuperAdmin) {
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
    if (!permissionsLoading && !isAdmin && !isSuperAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, isSuperAdmin, permissionsLoading, navigate]);

  if (permissionsLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ajustes</h1>
        <p className="text-muted-foreground mt-2">
          Configure todos os aspectos da sua clínica
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

      <Tabs defaultValue="clinica" className="space-y-6">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-max h-auto gap-1">
            <TabsTrigger value="clinica">Clínica</TabsTrigger>
            <TabsTrigger value="equipe">Equipe</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="nota-fiscal">Nota Fiscal</TabsTrigger>
            <TabsTrigger value="planos">Planos</TabsTrigger>
            <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="caixas">Caixas</TabsTrigger>
            <TabsTrigger value="cadeiras">Cadeiras</TabsTrigger>
            <TabsTrigger value="locais-estoque">Estoque</TabsTrigger>
            <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
            <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="clinica">
          <ClinicaTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="equipe">
          <ProfissionaisTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="usuarios">
          <UsuariosTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="nota-fiscal">
          <NotaFiscalTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="planos">
          <ProcedimentosTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="anamnese">
          <div className="text-center py-12 text-muted-foreground">
            Modelos de anamnese em desenvolvimento
          </div>
        </TabsContent>

        <TabsContent value="contratos">
          <ContratosTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="categorias">
          <CategoriasTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="caixas">
          <CaixasTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="cadeiras">
          <CadeirasTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="locais-estoque">
          <LocaisEstoqueTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="fornecedores">
          <FornecedoresTab clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="despesas">
          <DespesasTabV2 clinicaId={profile.clinic_id} />
        </TabsContent>

        <TabsContent value="comissoes">
          <RegrasComissaoTab clinicId={profile.clinic_id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
