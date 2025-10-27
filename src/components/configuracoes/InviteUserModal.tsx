import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  clinicaId: string;
}

export const InviteUserModal = ({ open, onClose, clinicaId }: InviteUserModalProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    perfil: "recepcao"
  });
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        nome: "",
        email: "",
        perfil: "recepcao"
      });
    }
  }, [open]);

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

  const handleInvite = async () => {
    if (!formData.nome.trim() || !formData.email.trim()) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      setSending(true);

      // Verificar se o e-mail já existe
      const { data: existing } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", formData.email.toLowerCase())
        .single();

      if (existing) {
        toast.error("Este e-mail já está cadastrado");
        return;
      }

      // Gerar ID temporário para o usuário
      const tempUserId = crypto.randomUUID();
      
      // Criar usuário placeholder
      const { data: newUser, error: userError } = await (supabase as any)
        .from("usuarios")
        .insert({
          id: tempUserId,
          clinica_id: clinicaId,
          nome: formData.nome,
          email: formData.email.toLowerCase(),
          perfil: formData.perfil
        })
        .select()
        .single() as any;

      if (userError) throw userError;

      toast.success("Usuário criado com sucesso! Use 'Esqueci minha senha' na tela de login para acessar.");

      // Criar role para o usuário
      await supabase
        .from("user_roles" as any)
        .insert({
          user_id: newUser.id,
          role: formData.perfil
        });

      // Registrar auditoria
      await supabase
        .from("audit_log" as any)
        .insert({
          entidade: "usuarios",
          entidade_id: newUser.id,
          acao: "invite",
          dif: formData
        });

      onClose();
    } catch (error: any) {
      toast.error("Erro ao enviar convite: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
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
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button onClick={handleInvite} disabled={sending}>
            {sending ? "Criando..." : "Criar Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
