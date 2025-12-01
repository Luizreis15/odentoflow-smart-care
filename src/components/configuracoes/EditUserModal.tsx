import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  usuario: any | null;
  clinicaId: string;
}

export const EditUserModal = ({ open, onClose, usuario, clinicaId }: EditUserModalProps) => {
  const [formData, setFormData] = useState<{
    nome: string;
    email: string;
    cpf: string;
    cargo: string;
    perfil: string;
  }>({
    nome: "",
    email: "",
    cpf: "",
    cargo: "",
    perfil: ""
  });
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && usuario) {
      setFormData({
        nome: usuario.nome || "",
        email: usuario.email || "",
        cpf: usuario.cpf || "",
        cargo: usuario.cargo || "",
        perfil: usuario.perfil || ""
      });
    }
  }, [open, usuario]);

  const loadProfissionais = async () => {
    try {
      const { data, error } = await supabase
        .from("profissionais")
        .select("id, nome, especialidade")
        .eq("clinica_id", clinicaId)
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      setProfissionais(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar profissionais:", error);
    }
  };

  const handleSave = async () => {
    if (!usuario) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("usuarios" as any)
        .update({
          nome: formData.nome,
          email: formData.email,
          cpf: formData.cpf,
          cargo: formData.cargo,
          perfil: formData.perfil
        })
        .eq("id", usuario.id);

      if (error) throw error;

      // Atualizar também user_roles se mudou o perfil
      if (formData.perfil !== usuario.perfil) {
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", usuario.id);

        await supabase
          .from("user_roles" as any)
          .insert({
            user_id: usuario.id,
            role: formData.perfil
          });
      }

      // Registrar auditoria
      await supabase
        .from("audit_log" as any)
        .insert({
          entidade: "usuarios",
          entidade_id: usuario.id,
          acao: "update",
          dif: formData
        });

      toast.success("Usuário atualizado com sucesso");
      onClose();
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Permissões: {usuario.nome}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                placeholder="Ex: Gerente, Secretária..."
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="perfil">Perfil *</Label>
            <Select
              value={formData.perfil}
              onValueChange={(value) => setFormData({ ...formData, perfil: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="recepcao">Recepcionista</SelectItem>
                <SelectItem value="dentista">Cirurgião-Dentista</SelectItem>
                <SelectItem value="assistente">Assistente</SelectItem>
              </SelectContent>
            </Select>
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
