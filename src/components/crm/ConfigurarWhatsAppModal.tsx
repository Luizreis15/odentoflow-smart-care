import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

interface ConfigurarWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConfigurarWhatsAppModal({ open, onOpenChange, onSuccess }: ConfigurarWhatsAppModalProps) {
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [webhookVerifyToken, setWebhookVerifyToken] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [existingConfig, setExistingConfig] = useState(false);

  useEffect(() => {
    if (open) {
      loadConfig();
    }
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
        .from("whatsapp_configs")
        .select("*")
        .eq("clinica_id", profile.clinic_id)
        .maybeSingle();

      if (data) {
        setExistingConfig(true);
        setAccessToken(data.access_token || "");
        setPhoneNumberId(data.phone_number_id || "");
        setBusinessAccountId(data.business_account_id || "");
        setWebhookVerifyToken(data.webhook_verify_token || "");
        setIsActive(data.is_active);
      } else {
        // Gerar token de verificação aleatório para novos
        setWebhookVerifyToken(generateRandomToken());
      }
    } catch (error) {
      console.error("Erro ao carregar config:", error);
    }
  };

  const generateRandomToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleSave = async () => {
    if (!accessToken || !phoneNumberId || !businessAccountId || !webhookVerifyToken) {
      toast.error("Preencha todos os campos obrigatórios");
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

      const { error } = await supabase
        .from("whatsapp_configs")
        .upsert({
          clinica_id: profile.clinic_id,
          access_token: accessToken,
          phone_number_id: phoneNumberId,
          business_account_id: businessAccountId,
          webhook_verify_token: webhookVerifyToken,
          is_active: isActive
        });

      if (error) throw error;

      toast.success("Configuração salva com sucesso!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(error.message || "Erro ao salvar configuração");
    } finally {
      setLoading(false);
    }
  };

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar WhatsApp Business API</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertDescription>
              <p className="font-semibold mb-2">Como obter as credenciais:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Acesse o <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  Meta for Developers <ExternalLink className="w-3 h-3" />
                </a></li>
                <li>Crie um App Business e configure o WhatsApp Business API</li>
                <li>Copie as credenciais e cole abaixo</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="access_token">Access Token *</Label>
              <Input
                id="access_token"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAxxxxxxxxxxxxx"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Token de acesso permanente do WhatsApp Business API
              </p>
            </div>

            <div>
              <Label htmlFor="phone_number_id">Phone Number ID *</Label>
              <Input
                id="phone_number_id"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="123456789012345"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ID do número de telefone registrado
              </p>
            </div>

            <div>
              <Label htmlFor="business_account_id">Business Account ID *</Label>
              <Input
                id="business_account_id"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                placeholder="123456789012345"
              />
            </div>

            <div>
              <Label htmlFor="webhook_verify_token">Webhook Verify Token *</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook_verify_token"
                  value={webhookVerifyToken}
                  onChange={(e) => setWebhookVerifyToken(e.target.value)}
                  placeholder="Token de verificação do webhook"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWebhookVerifyToken(generateRandomToken())}
                >
                  Gerar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use este token na configuração do webhook no Meta
              </p>
            </div>

            <Alert>
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">URL do Webhook:</p>
                <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                  {webhookUrl}
                </code>
                <p className="text-xs mt-2">
                  Configure esta URL no painel do Meta e use o token acima para verificação.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is_active">
                Ativar integração WhatsApp
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Configuração
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
