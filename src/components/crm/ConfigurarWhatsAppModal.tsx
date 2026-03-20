import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

interface ConfigurarWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConfigurarWhatsAppModal({ open, onOpenChange, onSuccess }: ConfigurarWhatsAppModalProps) {
  const [loading, setLoading] = useState(false);
  const [instanceId, setInstanceId] = useState("");
  const [instanceToken, setInstanceToken] = useState("");
  const [clientToken, setClientToken] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [existingConfig, setExistingConfig] = useState(false);

  useEffect(() => {
    if (open) loadConfig();
  }, [open]);

  const loadConfig = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.clinic_id) return;

      const { data } = await supabase
        .from("whatsapp_configs" as any)
        .select("*")
        .eq("clinica_id", profile.clinic_id)
        .maybeSingle();

      if (data) {
        setExistingConfig(true);
        setInstanceId((data as any).instance_id || "");
        setInstanceToken((data as any).instance_token || "");
        setClientToken((data as any).client_token || "");
        setIsActive((data as any).is_active || false);
      }
    } catch (error) {
      console.error("Erro ao carregar config:", error);
    }
  };

  const registerWebhook = async (instId: string, instToken: string, cToken: string) => {
    try {
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (cToken) headers['Client-Token'] = cToken;

      // Registrar webhook de mensagens recebidas
      const receivedRes = await fetch(
        `https://api.z-api.io/instances/${instId}/token/${instToken}/update-webhook-received`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ value: webhookUrl }),
        }
      );

      // Registrar webhook de status de mensagens
      const statusRes = await fetch(
        `https://api.z-api.io/instances/${instId}/token/${instToken}/update-webhook-message-status`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ value: webhookUrl }),
        }
      );

      console.log('Webhook received registration:', receivedRes.status);
      console.log('Webhook status registration:', statusRes.status);

      if (receivedRes.ok) {
        toast.success("Webhook registrado na Z-API com sucesso!");
      } else {
        const err = await receivedRes.text();
        console.error('Webhook registration error:', err);
        toast.warning("Config salva, mas o webhook pode não ter sido registrado. Verifique as credenciais.");
      }
    } catch (error) {
      console.error("Erro ao registrar webhook:", error);
      toast.warning("Config salva, mas erro ao registrar webhook na Z-API.");
    }
  };

  const handleSave = async () => {
    if (!instanceId.trim() || !instanceToken.trim()) {
      toast.error("Preencha o Instance ID e o Token");
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.clinic_id) throw new Error("Clínica não encontrada");

      if (existingConfig) {
        const { error } = await supabase
          .from("whatsapp_configs" as any)
          .update({
            connection_type: "web_qrcode",
            instance_id: instanceId.trim(),
            instance_token: instanceToken.trim(),
            client_token: clientToken.trim() || null,
            is_active: isActive,
          } as any)
          .eq("clinica_id", profile.clinic_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("whatsapp_configs" as any)
          .insert({
            clinica_id: profile.clinic_id,
            connection_type: "web_qrcode",
            instance_id: instanceId.trim(),
            instance_token: instanceToken.trim(),
            client_token: clientToken.trim() || null,
            is_active: isActive,
          } as any);

        if (error) throw error;
        setExistingConfig(true);
      }

      // Se ativou, registrar webhook na Z-API automaticamente
      if (isActive) {
        await registerWebhook(instanceId.trim(), instanceToken.trim(), clientToken.trim());
      }

      toast.success(isActive ? "WhatsApp configurado e ativado!" : "Configuração salva (inativa)");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(error.message || "Erro ao salvar configuração");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar WhatsApp (Z-API)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              <p className="font-semibold mb-1">Como obter as credenciais:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Crie uma conta em{" "}
                  <a href="https://z-api.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                    z-api.io <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Crie uma nova instância e pareie seu WhatsApp</li>
                <li>Copie o <strong>Instance ID</strong> e o <strong>Token</strong> e cole abaixo</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="instance_id">Instance ID *</Label>
            <Input
              id="instance_id"
              value={instanceId}
              onChange={(e) => setInstanceId(e.target.value)}
              placeholder="Ex: 3C7FA4B8E..."
            />
          </div>

          <div>
            <Label htmlFor="instance_token">Instance Token *</Label>
            <Input
              id="instance_token"
              type="password"
              value={instanceToken}
              onChange={(e) => setInstanceToken(e.target.value)}
              placeholder="Token da instância"
            />
          </div>

          <Alert className={isActive ? "border-green-600/30 bg-green-50 dark:bg-green-950/20" : "border-yellow-600/30 bg-yellow-50 dark:bg-yellow-950/20"}>
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="is_active" className="cursor-pointer font-semibold text-sm">
                    {isActive ? "Integração ATIVA" : "Ativar integração"}
                  </Label>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
