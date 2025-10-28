import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DadosContaTab from "@/components/perfil/DadosContaTab";
import EmailNotificacoesTab from "@/components/perfil/EmailNotificacoesTab";
import SegurancaTab from "@/components/perfil/SegurancaTab";
import PlanoCobrancaTab from "@/components/perfil/PlanoCobrancaTab";
import ContratosAssinaturasTab from "@/components/perfil/ContratosAssinaturasTab";
import PreferenciasTab from "@/components/perfil/PreferenciasTab";
import PrivacidadeLGPDTab from "@/components/perfil/PrivacidadeLGPDTab";
import IntegracoesTab from "@/components/perfil/IntegracoesTab";
import LogsAuditoriaTab from "@/components/perfil/LogsAuditoriaTab";
import EncerramentoPortabilidadeTab from "@/components/perfil/EncerramentoPortabilidadeTab";

const Perfil = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }
      setUserId(user.id);
    } catch (error: any) {
      console.error("Erro ao carregar usuário:", error);
      toast.error("Erro ao carregar dados do usuário");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais, preferências e configurações
        </p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="flex flex-wrap w-full h-auto gap-2 bg-muted/50 p-2">
            <TabsTrigger value="dados" className="text-xs whitespace-nowrap">Dados da Conta</TabsTrigger>
            <TabsTrigger value="email" className="text-xs whitespace-nowrap">E-mail & Notificações</TabsTrigger>
            <TabsTrigger value="seguranca" className="text-xs whitespace-nowrap">Segurança</TabsTrigger>
            <TabsTrigger value="plano" className="text-xs whitespace-nowrap">Plano & Cobrança</TabsTrigger>
            <TabsTrigger value="contratos" className="text-xs whitespace-nowrap">Contratos</TabsTrigger>
            <TabsTrigger value="preferencias" className="text-xs whitespace-nowrap">Preferências</TabsTrigger>
            <TabsTrigger value="privacidade" className="text-xs whitespace-nowrap">Privacidade</TabsTrigger>
            <TabsTrigger value="integracoes" className="text-xs whitespace-nowrap">Integrações</TabsTrigger>
            <TabsTrigger value="logs" className="text-xs whitespace-nowrap">Logs</TabsTrigger>
            <TabsTrigger value="encerramento" className="text-xs whitespace-nowrap">Encerramento</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-6">
            <DadosContaTab userId={userId} />
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <EmailNotificacoesTab userId={userId} />
          </TabsContent>

          <TabsContent value="seguranca" className="mt-6">
            <SegurancaTab userId={userId} />
          </TabsContent>

          <TabsContent value="plano" className="mt-6">
            <PlanoCobrancaTab userId={userId} />
          </TabsContent>

          <TabsContent value="contratos" className="mt-6">
            <ContratosAssinaturasTab userId={userId} />
          </TabsContent>

          <TabsContent value="preferencias" className="mt-6">
            <PreferenciasTab userId={userId} />
          </TabsContent>

          <TabsContent value="privacidade" className="mt-6">
            <PrivacidadeLGPDTab userId={userId} />
          </TabsContent>

          <TabsContent value="integracoes" className="mt-6">
            <IntegracoesTab userId={userId} />
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <LogsAuditoriaTab userId={userId} />
          </TabsContent>

          <TabsContent value="encerramento" className="mt-6">
            <EncerramentoPortabilidadeTab userId={userId} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Perfil;
