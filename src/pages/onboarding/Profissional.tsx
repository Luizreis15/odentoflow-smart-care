import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { z } from "zod";

const profissionalSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  cro: z.string().trim().min(4, "CRO deve ter pelo menos 4 caracteres").max(20),
  email: z.string().trim().email("Email inválido").max(255),
  telefone: z.string().trim().regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos"),
  especialidade: z.string().trim().optional().or(z.literal("")),
});

const Profissional = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [cro, setCro] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const isLiberal = searchParams.get("tipo") === "liberal";

  useEffect(() => {
    const createLiberalClinic = async () => {
      if (!isLiberal) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single();
      if (profile?.clinic_id) return;

      const { data: clinicData, error } = await (supabase as any)
        .from("clinicas")
        .insert({
          nome: `Consultório ${user.user_metadata?.full_name || "Profissional"}`,
          tipo: "liberal",
          owner_user_id: user.id,
          onboarding_status: "in_progress",
          plano: "starter",
          status_assinatura: "trialing",
        })
        .select()
        .single();

      if (!error && clinicData) {
        await supabase.from("profiles").update({ clinic_id: clinicData.id }).eq("id", user.id);
        await (supabase as any).from("usuarios").update({ clinica_id: clinicData.id }).eq("id", user.id);
      }
    };

    createLiberalClinic();
  }, [isLiberal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = profissionalSchema.safeParse({ nome, cro, email, telefone, especialidade: especialidade || undefined });

    if (!validation.success) {
      toast({ variant: "destructive", title: "Erro de validação", description: validation.error.errors[0].message });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single();
      if (!profile?.clinic_id) throw new Error("Clínica não encontrada");

      const { error } = await (supabase as any).from("profissionais").insert({
        clinica_id: profile.clinic_id,
        nome: validation.data.nome,
        cro: validation.data.cro,
        email: validation.data.email,
        telefone: validation.data.telefone,
        especialidade: validation.data.especialidade || null,
        perfil: "responsavel",
        ativo: true,
      });

      if (error) throw error;

      await (supabase as any).from("clinicas").update({ onboarding_status: "completed" }).eq("id", profile.clinic_id);

      toast({ title: "Cadastro concluído!", description: "Bem-vindo ao OdontoFlow!" });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao cadastrar profissional", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <Button variant="ghost" onClick={() => navigate(isLiberal ? "/onboarding/tipo" : "/onboarding/clinica")}>
            <ArrowLeft className="w-4 h-4 mr-2" />Voltar
          </Button>
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Profissional Responsável</CardTitle>
              <CardDescription>Cadastre o dentista responsável pela clínica</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" placeholder="Dr. João Silva" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cro">CRO *</Label>
                    <Input id="cro" placeholder="CRO-SP 12345" value={cro} onChange={(e) => setCro(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="especialidade">Especialidade</Label>
                    <Input id="especialidade" placeholder="Ortodontia" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="dentista@clinica.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input id="telefone" type="tel" placeholder="11999999999" value={telefone} onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ""))} maxLength={11} required />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(isLiberal ? "/onboarding/tipo" : "/onboarding/clinica")} disabled={loading}>Voltar</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Concluir Cadastro
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profissional;
