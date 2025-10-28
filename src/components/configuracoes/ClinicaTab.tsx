import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ClinicaTabProps {
  clinicaId: string;
}

export function ClinicaTab({ clinicaId }: ClinicaTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    loadConfig();
  }, [clinicaId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("configuracoes_clinica")
        .select("*")
        .eq("clinica_id", clinicaId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setConfig(data || {
        clinica_id: clinicaId,
        email_contato: "",
        whatsapp: "",
        imprimir_papel_timbrado: false,
        horario_funcionamento: {
          seg: { inicio: "08:00", fim: "18:00" },
          ter: { inicio: "08:00", fim: "18:00" },
          qua: { inicio: "08:00", fim: "18:00" },
          qui: { inicio: "08:00", fim: "18:00" },
          sex: { inicio: "08:00", fim: "18:00" },
          sab: { inicio: "08:00", fim: "12:00" },
          dom: { fechado: true }
        }
      });
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("configuracoes_clinica")
        .upsert({
          ...config,
          clinica_id: clinicaId
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso"
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados Gerais</CardTitle>
          <CardDescription>
            Informações básicas e contato da clínica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Contato</Label>
              <Input
                id="email"
                type="email"
                value={config?.email_contato || ""}
                onChange={(e) => setConfig({ ...config, email_contato: e.target.value })}
                placeholder="contato@clinica.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={config?.whatsapp || ""}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="papel-timbrado"
              checked={config?.imprimir_papel_timbrado || false}
              onCheckedChange={(checked) =>
                setConfig({ ...config, imprimir_papel_timbrado: checked })
              }
            />
            <Label htmlFor="papel-timbrado">
              Imprimir em papel timbrado
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário de Funcionamento</CardTitle>
          <CardDescription>
            Configure os horários de atendimento da clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Configuração de horários em desenvolvimento
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}