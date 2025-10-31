import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ExternalLink, CheckCircle2, QrCode, Smartphone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConfigurarWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConfigurarWhatsAppModal({ open, onOpenChange, onSuccess }: ConfigurarWhatsAppModalProps) {
  const [loading, setLoading] = useState(false);
  const [connectionType, setConnectionType] = useState<'api_oficial' | 'web_qrcode'>('web_qrcode');
  
  // Campos API Oficial
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [webhookVerifyToken, setWebhookVerifyToken] = useState("");
  
  // Campos Web QR Code
  const [qrCode, setQrCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectingQR, setConnectingQR] = useState(false);
  
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
        .from("whatsapp_configs" as any)
        .select("*")
        .eq("clinica_id", profile.clinic_id)
        .maybeSingle();

      if (data) {
        setExistingConfig(true);
        setConnectionType((data as any).connection_type || 'api_oficial');
        setAccessToken((data as any).access_token || "");
        setPhoneNumberId((data as any).phone_number_id || "");
        setBusinessAccountId((data as any).business_account_id || "");
        setWebhookVerifyToken((data as any).webhook_verify_token || "");
        setIsActive((data as any).is_active);
        setIsConnected(!!(data as any).connected_at);
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

  const handleGenerateQR = async () => {
    setConnectingQR(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.clinic_id) throw new Error("Clínica não encontrada");

      const { data, error } = await supabase.functions.invoke('whatsapp-qr-connect', {
        body: { clinica_id: profile.clinic_id }
      });

      if (error) throw error;
      
      setQrCode(data.qr_code);
      
      // Polling para verificar conexão
      const checkInterval = setInterval(async () => {
        const { data: config } = await supabase
          .from("whatsapp_configs" as any)
          .select("connected_at")
          .eq("clinica_id", profile.clinic_id)
          .maybeSingle();
        
        if (config && (config as any).connected_at) {
          setIsConnected(true);
          setQrCode("");
          clearInterval(checkInterval);
          toast.success("WhatsApp conectado com sucesso!");
        }
      }, 3000);

      // Limpar polling após 2 minutos
      setTimeout(() => clearInterval(checkInterval), 120000);
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar QR Code");
    } finally {
      setConnectingQR(false);
    }
  };

  const handleSave = async () => {
    // Validação para API Oficial
    if (connectionType === 'api_oficial') {
      if (!accessToken || !phoneNumberId || !businessAccountId || !webhookVerifyToken) {
        toast.error("Preencha todos os campos obrigatórios da API Oficial");
        return;
      }
    }

    // Validação para QR Code
    if (connectionType === 'web_qrcode' && !isConnected) {
      toast.error("Você precisa conectar o WhatsApp via QR Code primeiro");
      return;
    }

    // Alertar se não ativar a integração
    if (!isActive) {
      toast.warning("⚠️ Atenção: Você não ativou a integração! Ative o switch abaixo para usar o sistema.", {
        duration: 5000
      });
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.clinic_id) throw new Error("Clínica não encontrada");

      const configData: any = {
        clinica_id: profile.clinic_id,
        connection_type: connectionType,
        is_active: isActive
      };

      if (connectionType === 'api_oficial') {
        configData.access_token = accessToken;
        configData.phone_number_id = phoneNumberId;
        configData.business_account_id = businessAccountId;
        configData.webhook_verify_token = webhookVerifyToken;
      }

      const { error } = await supabase
        .from("whatsapp_configs" as any)
        .upsert(configData);

      if (error) throw error;

      if (isActive) {
        toast.success("✅ WhatsApp configurado e ativado com sucesso!");
      } else {
        toast.warning("⚠️ Configuração salva, mas a integração não está ativa. Ative o switch para usar.");
      }
      
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

        <Tabs value={connectionType} onValueChange={(v) => setConnectionType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="web_qrcode" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              WhatsApp Web (QR Code)
            </TabsTrigger>
            <TabsTrigger value="api_oficial" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              API Oficial Meta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="web_qrcode" className="space-y-4 mt-6">
            <Alert>
              <AlertDescription>
                <p className="font-semibold mb-2">✅ Método Gratuito - Sem necessidade de API paga</p>
                <p className="text-sm">Conecte seu WhatsApp escaneando um QR Code, sem custos adicionais.</p>
              </AlertDescription>
            </Alert>

            {!isConnected && !qrCode && (
              <div className="flex flex-col items-center gap-4 py-8">
                <p className="text-muted-foreground text-center">
                  Clique no botão abaixo para gerar o QR Code e conectar seu WhatsApp
                </p>
                <Button 
                  onClick={handleGenerateQR} 
                  disabled={connectingQR}
                  size="lg"
                >
                  {connectingQR && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Gerar QR Code
                </Button>
              </div>
            )}

            {qrCode && !isConnected && (
              <div className="flex flex-col items-center gap-4 py-8">
                <p className="font-semibold">Escaneie este QR Code no seu WhatsApp:</p>
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
                <Alert>
                  <AlertDescription className="text-sm">
                    <p className="font-semibold mb-1">Como escanear:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Abra o WhatsApp no seu celular</li>
                      <li>Toque em Mais opções (⋮) → Aparelhos conectados</li>
                      <li>Toque em "Conectar um aparelho"</li>
                      <li>Aponte seu celular para esta tela para escanear o código</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {isConnected && (
              <Alert>
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>
                  <p className="font-semibold text-green-600">✅ WhatsApp conectado com sucesso!</p>
                  <p className="text-sm mt-1">Seu WhatsApp está pronto para uso.</p>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="api_oficial" className="space-y-4 mt-6">
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
            </div>
          </TabsContent>
        </Tabs>

        <Alert className={isActive ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="is_active" className="cursor-pointer font-semibold">
                  {isActive ? "✅ Integração ATIVA" : "⚠️ Ativar integração WhatsApp"}
                </Label>
              </div>
              {!isActive && (
                <Badge variant="outline" className="bg-yellow-100">
                  INATIVO
                </Badge>
              )}
            </div>
            <p className="text-xs mt-2 text-muted-foreground">
              {isActive 
                ? "O sistema de atendimento WhatsApp está pronto para uso!" 
                : "Ative este switch para começar a usar o sistema de atendimento."}
            </p>
          </AlertDescription>
        </Alert>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Configuração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
