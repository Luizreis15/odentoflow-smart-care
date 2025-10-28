import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AdiantamentoModalProps {
  open: boolean;
  onClose: () => void;
  clinicId: string;
  profissionais: any[];
}

export const AdiantamentoModal = ({ open, onClose, clinicId, profissionais }: AdiantamentoModalProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    profissional_id: "",
    valor: "",
    data_adiantamento: new Date().toISOString().split("T")[0],
    forma_pagamento: "dinheiro",
    observacoes: "",
  });

  const handleSave = async () => {
    if (!formData.profissional_id || !formData.valor) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const valor = parseFloat(formData.valor);
    if (valor <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    try {
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Verificar limite de adiantamento do profissional
      const { data: remuneracao, error: remError } = await supabase
        .from("profissional_remuneracao")
        .select("*")
        .eq("profissional_id", formData.profissional_id)
        .eq("ativo", true)
        .single();

      if (remError) throw remError;

      if (!remuneracao?.adiantamento_permitido) {
        toast.error("Este profissional não tem adiantamento habilitado");
        return;
      }

      if (remuneracao.limite_adiantamento && valor > parseFloat(String(remuneracao.limite_adiantamento))) {
        toast.error(`Valor excede o limite de R$ ${parseFloat(String(remuneracao.limite_adiantamento)).toFixed(2)}`);
        return;
      }

      // Criar adiantamento
      const { error: adError } = await supabase
        .from("comissoes_adiantamentos")
        .insert({
          clinic_id: clinicId,
          profissional_id: formData.profissional_id,
          valor: valor,
          data_adiantamento: formData.data_adiantamento,
          forma_pagamento: formData.forma_pagamento,
          saldo: valor,
          quitado: false,
          concedido_por: user.id,
          observacoes: formData.observacoes,
        });

      if (adError) throw adError;

      // Criar transação financeira
      const profissional = profissionais.find((p) => p.id === formData.profissional_id);
      const { error: transError } = await supabase
        .from("financial_transactions")
        .insert({
          clinic_id: clinicId,
          type: "despesa",
          date: formData.data_adiantamento,
          value: valor,
          category: "Adiantamentos",
          reference: `Adiantamento - ${profissional?.nome}`,
        });

      if (transError) throw transError;

      toast.success("Adiantamento registrado com sucesso");
      onClose();
      
      // Resetar form
      setFormData({
        profissional_id: "",
        valor: "",
        data_adiantamento: new Date().toISOString().split("T")[0],
        forma_pagamento: "dinheiro",
        observacoes: "",
      });
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao registrar adiantamento: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Adiantamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profissional">Profissional *</Label>
            <Select
              value={formData.profissional_id}
              onValueChange={(value) => setFormData({ ...formData, profissional_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {profissionais.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={formData.data_adiantamento}
              onChange={(e) => setFormData({ ...formData, data_adiantamento: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
            <Select
              value={formData.forma_pagamento}
              onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Adicione observações sobre este adiantamento..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};