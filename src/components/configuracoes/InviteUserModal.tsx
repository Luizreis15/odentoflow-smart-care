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
    perfil: "recepcionista",
    profissional_id: ""
  });
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      loadProfissionais();
      setFormData({
        nome: "",
        email: "",
        perfil: "recepcionista",
        profissional_id: ""
      });
    }
  }, [open, clinicaId]);

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

      // Criar usuário placeholder
          const { error: userError } = await (supabase as any)
            .from("usuarios")
            .insert({
              clinica_id: clinicaId,
              nome: formData.nome,
              email: formData.email.toLowerCase(),
              perfil: formData.perfil,
              profissional_id: formData.profissional_id || null
            })
            .select()
            .single() as any;

          if (userError) throw userError;

      toast.success("Usuário criado com sucesso! Use 'Esqueci minha senha' na tela de login para acessar.");

      // Registrar auditoria
      await supabase
        .from("audit_log" as any)
        .insert({
          entidade: "usuarios",
          entidade_id: userError?.id || "",
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
                <SelectItem value="recepcionista">Recepcionista</SelectItem>
                <SelectItem value="cirurgiao_dentista">Cirurgião-Dentista</SelectItem>
                <SelectItem value="asb">ASB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profissional">Vincular a Profissional (opcional)</Label>
            <Select
              value={formData.profissional_id || undefined}
              onValueChange={(value) => setFormData({ ...formData, profissional_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum profissional vinculado" />
              </SelectTrigger>
              <SelectContent>
                {profissionais.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.nome} {prof.especialidade && `- ${prof.especialidade}`}
                  </SelectItem>
                ))}
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
