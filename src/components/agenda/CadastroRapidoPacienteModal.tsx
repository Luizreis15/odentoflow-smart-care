import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const quickPatientSchema = z.object({
  full_name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
  phone: z.string().trim().min(10, "Telefone inválido").max(15, "Telefone inválido"),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  cpf: z.string().trim().optional().or(z.literal("")),
});

interface CadastroRapidoPacienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated: (patientId: string) => void;
}

export const CadastroRapidoPacienteModal = ({
  open,
  onOpenChange,
  onPatientCreated,
}: CadastroRapidoPacienteModalProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    cpf: "",
    birth_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar dados
      const validatedData = quickPatientSchema.parse(formData);

      setSaving(true);

      // Buscar clinic_id do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (!profile?.clinic_id) throw new Error("Clínica não encontrada");

      // Criar paciente
      const { data: newPatient, error } = await supabase
        .from("patients")
        .insert({
          full_name: validatedData.full_name,
          phone: validatedData.phone,
          email: validatedData.email || null,
          cpf: validatedData.cpf || null,
          birth_date: formData.birth_date || null,
          clinic_id: profile.clinic_id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Paciente cadastrado com sucesso!");
      
      // Resetar form
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        cpf: "",
        birth_date: "",
      });

      // Fechar modal e informar ID do paciente criado
      onOpenChange(false);
      onPatientCreated(newPatient.id);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Erro ao criar paciente:", error);
        toast.error("Erro ao criar paciente: " + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Paciente</DialogTitle>
          <DialogDescription>
            Preencha as informações básicas para agendar rapidamente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              placeholder="João da Silva"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={saving}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={saving}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              disabled={saving}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
