import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, MessageSquare, Check, X, Settings, Info, Smartphone } from "lucide-react";

interface WhatsAppConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicaId: string;
}

interface WhatsAppConfig {
  id?: string;
  instance_id: string;
  instance_token: string;
  connected: boolean;
  phone_connected: string | null;
  confirmacao_automatica: boolean;
  lembrete_24h: boolean;
  lembrete_1h: boolean;
  mensagem_confirmacao: string;
  mensagem_lembrete: string;
}

const DEFAULT_CONFIG: WhatsAppConfig = {
  instance_id: "",
  instance_token: "",
  connected: false,
  phone_connected: null,
  confirmacao_automatica: false,
  lembrete_24h: false,
  lembrete_1h: false,
  mensagem_confirmacao: "Olá {paciente}! Confirmando sua consulta em {data} às {hora} na {clinica}. Responda SIM para confirmar ou NÃO para reagendar.",
  mensagem_lembrete: "Olá {paciente}! Lembrando que você tem uma consulta amanhã, {data} às {hora}, na {clinica}.",
};

export function WhatsAppConfigModal({ open, onOpenChange, clinicaId }: WhatsAppConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState<WhatsAppConfig>(DEFAULT_CONFIG);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open, clinicaId]);

  const loadConfig = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("whatsapp_config")
        .select("*")
        .eq("clinic_id", clinicaId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setConfig({
          id: data.id,
          instance_id: data.instance_id || "",
          instance_token: data.instance_token || "",
          connected: data.connected || false,
          phone_connected: data.phone_connected,
          confirmacao_automatica: data.confirmacao_automatica || false,
          lembrete_24h: data.lembrete_24h || false,
          lembrete_1h: data.lembrete_1h || false,
          mensagem_confirmacao: data.mensagem_confirmacao || DEFAULT_CONFIG.mensagem_confirmacao,
          mensagem_lembrete: data.mensagem_lembrete || DEFAULT_CONFIG.mensagem_lembrete,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!config.instance_id || !config.instance_token) {
      toast.error("Preencha o Instance ID e Token da Z-API");
      return;
    }

    try {
      setTesting(true);

      // Testar conexão com Z-API
      const response = await fetch(`https://api.z-api.io/instances/${config.instance_id}/token/${config.instance_token}/status`, {
        method: "GET",
      });

      const data = await response.json();

      if (data.connected) {
        setConfig({
          ...config,
          connected: true,
          phone_connected: data.smartphoneConnected || data.phoneConnected || null,
        });
        toast.success("Conectado com sucesso!");
      } else {
        setConfig({ ...config, connected: false, phone_connected: null });
        toast.warning("Instância não conectada. Escaneie o QR Code no painel Z-API.");
      }
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      toast.error("Erro ao conectar. Verifique as credenciais.");
      setConfig({ ...config, connected: false, phone_connected: null });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        clinic_id: clinicaId,
        provider: "zapi",
        instance_id: config.instance_id,
        instance_token: config.instance_token,
        connected: config.connected,
        phone_connected: config.phone_connected,
        confirmacao_automatica: config.confirmacao_automatica,
        lembrete_24h: config.lembrete_24h,
        lembrete_1h: config.lembrete_1h,
        mensagem_confirmacao: config.mensagem_confirmacao,
        mensagem_lembrete: config.mensagem_lembrete,
      };

      const { error } = await supabase
        .from("whatsapp_config")
        .upsert(payload, { onConflict: "clinic_id" });

      if (error) throw error;

      toast.success("Configurações salvas!");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Configurar WhatsApp (Z-API)
          </DialogTitle>
          <DialogDescription>
            Configure a integração com WhatsApp para enviar confirmações automáticas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status da Conexão */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Status da Conexão</p>
                    {config.connected ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Conectado
                        </Badge>
                        {config.phone_connected && (
                          <span className="text-sm text-muted-foreground">
                            {config.phone_connected}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary">
                        <X className="h-3 w-3 mr-1" />
                        Desconectado
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing}
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Testar Conexão"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Credenciais Z-API */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Credenciais Z-API
              </h3>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Acesse o painel da{" "}
                  <a
                    href="https://z-api.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Z-API
                  </a>{" "}
                  para obter seu Instance ID e Token. É necessário ter uma conta ativa.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instance_id">Instance ID</Label>
                  <Input
                    id="instance_id"
                    value={config.instance_id}
                    onChange={(e) => setConfig({ ...config, instance_id: e.target.value })}
                    placeholder="Seu Instance ID"
                  />
                </div>
                <div>
                  <Label htmlFor="instance_token">Token</Label>
                  <div className="relative">
                    <Input
                      id="instance_token"
                      type={showToken ? "text" : "password"}
                      value={config.instance_token}
                      onChange={(e) => setConfig({ ...config, instance_token: e.target.value })}
                      placeholder="Seu Token"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? "Ocultar" : "Mostrar"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automações */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Automações</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Confirmação automática</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar mensagem pedindo confirmação quando agendar
                    </p>
                  </div>
                  <Switch
                    checked={config.confirmacao_automatica}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, confirmacao_automatica: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Lembrete 24h antes</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembrete um dia antes da consulta
                    </p>
                  </div>
                  <Switch
                    checked={config.lembrete_24h}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, lembrete_24h: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Lembrete 1h antes</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembrete uma hora antes da consulta
                    </p>
                  </div>
                  <Switch
                    checked={config.lembrete_1h}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, lembrete_1h: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensagens */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Personalizar Mensagens</h3>
              <p className="text-sm text-muted-foreground">
                Use as variáveis: {"{paciente}"}, {"{data}"}, {"{hora}"}, {"{clinica}"}, {"{profissional}"}
              </p>

              <div>
                <Label>Mensagem de confirmação</Label>
                <Textarea
                  value={config.mensagem_confirmacao}
                  onChange={(e) => setConfig({ ...config, mensagem_confirmacao: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Mensagem de lembrete</Label>
                <Textarea
                  value={config.mensagem_lembrete}
                  onChange={(e) => setConfig({ ...config, mensagem_lembrete: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
