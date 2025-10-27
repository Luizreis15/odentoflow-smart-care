import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { z } from "zod";

const clinicSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Nome da clínica deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter menos de 100 caracteres"),
  cnpj: z.string()
    .trim()
    .regex(/^\d{14}$/, "CNPJ deve conter exatamente 14 dígitos")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .trim()
    .regex(/^\d{10,11}$/, "Telefone deve conter 10 ou 11 dígitos")
    .optional()
    .or(z.literal(""))
});

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clinicName, setClinicName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = clinicSchema.safeParse({ 
      name: clinicName, 
      cnpj: cnpj || undefined,
      phone: phone || undefined
    });

    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: validation.error.errors[0].message,
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('complete_user_onboarding', {
        _clinic_name: validation.data.name,
        _clinic_cnpj: validation.data.cnpj || null,
        _clinic_phone: validation.data.phone || null
      });

      if (error) throw error;

      toast({
        title: "Clínica criada com sucesso!",
        description: "Você já pode acessar o painel.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar clínica",
        description: error.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Configure sua Clínica</CardTitle>
            <CardDescription className="text-center">
              Complete seu cadastro informando os dados da clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Nome da Clínica *</Label>
                <Input
                  id="clinic-name"
                  type="text"
                  placeholder="Clínica Odontológica Exemplo"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00000000000000"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ""))}
                  maxLength={14}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="11999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={11}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Clínica
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
