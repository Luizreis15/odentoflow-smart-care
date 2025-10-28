import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      
      // Carregar dados da clínica
      const { data: clinicaData, error: clinicaError } = await supabase
        .from("clinicas")
        .select("*")
        .eq("id", clinicaId)
        .single();

      if (clinicaError) throw clinicaError;

      // Carregar configurações adicionais
      const { data: configData, error: configError } = await supabase
        .from("configuracoes_clinica")
        .select("*")
        .eq("clinica_id", clinicaId)
        .maybeSingle();

      if (configError && configError.code !== 'PGRST116') throw configError;

      setConfig({
        ...clinicaData,
        ...configData,
        clinica_id: clinicaId,
        email_contato: configData?.email_contato || "",
        whatsapp: configData?.whatsapp || "",
        telefone: clinicaData?.telefone || "",
        imprimir_papel_timbrado: configData?.imprimir_papel_timbrado || false,
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

      // Atualizar dados da clínica
      const { error: clinicaError } = await supabase
        .from("clinicas")
        .update({
          nome: config.nome,
          cnpj: config.cnpj,
          telefone: config.telefone,
          address: config.address
        })
        .eq("id", clinicaId);

      if (clinicaError) throw clinicaError;

      // Atualizar configurações adicionais
      const { error: configError } = await supabase
        .from("configuracoes_clinica")
        .upsert({
          clinica_id: clinicaId,
          email_contato: config.email_contato,
          whatsapp: config.whatsapp,
          imprimir_papel_timbrado: config.imprimir_papel_timbrado,
          horario_funcionamento: config.horario_funcionamento
        });

      if (configError) throw configError;

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
          <CardTitle>Dados da Clínica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da clínica *</Label>
              <Input
                id="nome"
                value={config?.nome || ""}
                onChange={(e) => setConfig({ ...config, nome: e.target.value })}
                placeholder="Nome da clínica"
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ da clínica</Label>
              <Input
                id="cnpj"
                value={config?.cnpj || ""}
                onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_comunicacao">Nome utilizado nas comunicações *</Label>
              <Input
                id="nome_comunicacao"
                value={config?.nome || ""}
                onChange={(e) => setConfig({ ...config, nome: e.target.value })}
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável pela clínica *</Label>
              <Input
                id="responsavel"
                value={config?.owner_user_id || ""}
                disabled
                maxLength={150}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário de Funcionamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Horário inicial da clínica *</Label>
              <Select defaultValue="7">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>{i}:00</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Horário final da clínica *</Label>
              <Select defaultValue="22">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>{i}:00</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuso horário *</Label>
              <Select defaultValue="brasilia">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brasilia">Brasília/São Paulo</SelectItem>
                  <SelectItem value="manaus">Manaus</SelectItem>
                  <SelectItem value="rio-branco">Rio Branco</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fiscal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Emitir recibo em nome de</Label>
            <Select defaultValue="clinica">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinica">Clínica</SelectItem>
                <SelectItem value="profissional">Profissional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da clínica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={config?.email_contato || ""}
                onChange={(e) => setConfig({ ...config, email_contato: e.target.value })}
                placeholder="email@clinica.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={config?.telefone || ""}
                onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                placeholder="(00) 0000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="celular">Celular *</Label>
              <Input
                id="celular"
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
              Imprimir com papel timbrado
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input placeholder="00000-000" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Rua</Label>
              <Input />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Complemento</Label>
              <Input />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input />
            </div>
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