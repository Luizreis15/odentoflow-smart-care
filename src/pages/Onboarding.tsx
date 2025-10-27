import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const onboardingSchema = z.object({
  clinicName: z.string()
    .trim()
    .min(2, "Nome da clínica deve ter pelo menos 2 caracteres")
    .max(100, "Nome da clínica deve ter menos de 100 caracteres"),
  cnpj: z.string()
    .trim()
    .regex(/^\d{14}$/, "CNPJ deve conter 14 dígitos")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .trim()
    .regex(/^\+?[\d\s-()]{10,}$/, "Telefone inválido")
    .optional()
    .or(z.literal("")),
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

    const validation = onboardingSchema.safeParse({ clinicName, cnpj, phone });
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
        _clinic_name: validation.data.clinicName,
        _clinic_cnpj: validation.data.cnpj || null,
        _clinic_phone: validation.data.phone || null,
      });

      if (error) throw error;

      toast({
        title: "Clínica criada com sucesso!",
        description: "Bem-vindo ao OdontoFlow",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar clínica",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Bem-vindo ao OdontoFlow</CardTitle>
          <CardDescription className="text-center">
            Configure sua clínica para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Nome da Clínica *</Label>
              <Input
                id="clinic-name"
                type="text"
                placeholder="Clínica OdontoFlow"
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
                onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))}
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+55 11 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
  );
};

export default Onboarding;
