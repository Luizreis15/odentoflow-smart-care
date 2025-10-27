import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfissionalModalProps {
  open: boolean;
  onClose: () => void;
  profissional: any | null;
  clinicaId: string;
}

export const ProfissionalModal = ({ open, onClose, profissional, clinicaId }: ProfissionalModalProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    cro: "",
    especialidade: "",
    email: "",
    telefone: "",
    perfil_profissional: "dentista",
    ativo: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profissional) {
      setFormData({
        nome: profissional.nome || "",
        cro: profissional.cro || "",
        especialidade: profissional.especialidade || "",
        email: profissional.email || "",
        telefone: profissional.telefone || "",
        perfil_profissional: profissional.perfil_profissional || "dentista",
        ativo: profissional.ativo ?? true
      });
    } else {
      setFormData({
        nome: "",
        cro: "",
        especialidade: "",
        email: "",
        telefone: "",
        perfil_profissional: "dentista",
        ativo: true
      });
    }
  }, [profissional, open]);

  const handleSave = async () => {
    if (!formData.nome.trim() || !formData.email.trim()) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      setSaving(true);

      if (profissional) {
        // Atualizar
        const { error } = await supabase
          .from("profissionais")
          .update(formData)
          .eq("id", profissional.id);

        if (error) throw error;

        // Registrar auditoria
        await supabase
          .from("audit_log" as any)
          .insert({
            entidade: "profissionais",
            entidade_id: profissional.id,
            acao: "update",
            dif: formData
          });

        toast.success("Profissional atualizado com sucesso");
      } else {
        // Criar
        const { data, error } = await supabase
          .from("profissionais")
          .insert({
            ...formData,
            clinica_id: clinicaId
          })
          .select()
          .single();

        if (error) throw error;

        // Registrar auditoria
        await supabase
          .from("audit_log" as any)
          .insert({
            entidade: "profissionais",
            entidade_id: data.id,
            acao: "create",
            dif: formData
          });

        toast.success("Profissional cadastrado com sucesso");
      }

      onClose();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {profissional ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cro">CRO</Label>
              <Input
                id="cro"
                value={formData.cro}
                onChange={(e) => setFormData({ ...formData, cro: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="especialidade">Especialidade</Label>
              <Input
                id="especialidade"
                value={formData.especialidade}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil *</Label>
              <Select
                value={formData.perfil_profissional}
                onValueChange={(value) => setFormData({ ...formData, perfil_profissional: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="responsavel">Responsável</SelectItem>
                  <SelectItem value="dentista">Dentista</SelectItem>
                  <SelectItem value="asb">ASB</SelectItem>
                  <SelectItem value="recepcao">Recepção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
