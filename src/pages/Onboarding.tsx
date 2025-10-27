import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, UserCog } from "lucide-react";
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

const dentistSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter menos de 100 caracteres"),
  cro: z.string()
    .trim()
    .min(4, "CRO deve ter pelo menos 4 caracteres")
    .max(20, "CRO inválido"),
  email: z.string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo"),
  phone: z.string()
    .trim()
    .regex(/^\d{10,11}$/, "Telefone deve conter 10 ou 11 dígitos"),
  specialty: z.string()
    .trim()
    .min(2, "Especialidade deve ter pelo menos 2 caracteres")
    .optional()
    .or(z.literal(""))
});

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [clinicId, setClinicId] = useState<string | null>(null);
  
  // Clinic form state
  const [clinicName, setClinicName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  
  // Dentist form state
  const [dentistName, setDentistName] = useState("");
  const [cro, setCro] = useState("");
  const [dentistEmail, setDentistEmail] = useState("");
  const [dentistPhone, setDentistPhone] = useState("");
  const [specialty, setSpecialty] = useState("");

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = clinicSchema.safeParse({ 
      name: clinicName, 
      cnpj: cnpj || undefined,
      phone: clinicPhone || undefined
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

      // Get the created clinic_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (!profile?.clinic_id) throw new Error("Erro ao obter clínica");

      setClinicId(profile.clinic_id);
      setStep(2);

      toast({
        title: "Clínica criada com sucesso!",
        description: "Agora cadastre o dentista responsável.",
      });
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

  const handleDentistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = dentistSchema.safeParse({ 
      full_name: dentistName,
      cro: cro,
      email: dentistEmail,
      phone: dentistPhone,
      specialty: specialty || undefined
    });

    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: validation.error.errors[0].message,
      });
      return;
    }

    if (!clinicId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Clínica não encontrada. Por favor, recomece o cadastro.",
      });
      return;
    }

    setLoading(true);

    try {
      // Create the professional
      const { error } = await supabase
        .from("professionals")
        .insert({
          clinic_id: clinicId,
          full_name: validation.data.full_name,
          cro: validation.data.cro,
          email: validation.data.email,
          phone: validation.data.phone,
          specialty: validation.data.specialty || null,
        });

      if (error) throw error;

      toast({
        title: "Cadastro concluído!",
        description: "Dentista cadastrado com sucesso. Bem-vindo ao OdontoFlow!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar dentista",
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
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === 1 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="hidden sm:inline font-medium">Clínica</span>
              </div>
              <div className="w-12 h-0.5 bg-border" />
              <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                  <UserCog className="w-5 h-5" />
                </div>
                <span className="hidden sm:inline font-medium">Dentista</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {step === 1 ? "Cadastre sua Clínica" : "Cadastre o Dentista Responsável"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 
                ? "Passo 1 de 2: Informe os dados da sua clínica odontológica" 
                : "Passo 2 de 2: É necessário pelo menos um dentista para usar o sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleClinicSubmit} className="space-y-4">
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
                  <Label htmlFor="clinic-phone">Telefone (opcional)</Label>
                  <Input
                    id="clinic-phone"
                    type="tel"
                    placeholder="11999999999"
                    value={clinicPhone}
                    onChange={(e) => setClinicPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={11}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Próximo: Cadastrar Dentista
                </Button>
              </form>
            ) : (
              <form onSubmit={handleDentistSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dentist-name">Nome Completo *</Label>
                  <Input
                    id="dentist-name"
                    type="text"
                    placeholder="Dr. João Silva"
                    value={dentistName}
                    onChange={(e) => setDentistName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cro">CRO *</Label>
                    <Input
                      id="cro"
                      type="text"
                      placeholder="CRO-SP 12345"
                      value={cro}
                      onChange={(e) => setCro(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                      id="specialty"
                      type="text"
                      placeholder="Ortodontia"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dentist-email">Email *</Label>
                  <Input
                    id="dentist-email"
                    type="email"
                    placeholder="dentista@clinica.com"
                    value={dentistEmail}
                    onChange={(e) => setDentistEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dentist-phone">Telefone *</Label>
                  <Input
                    id="dentist-phone"
                    type="tel"
                    placeholder="11999999999"
                    value={dentistPhone}
                    onChange={(e) => setDentistPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={11}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Concluir Cadastro
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
