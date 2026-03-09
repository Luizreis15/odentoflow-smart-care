import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Copy } from "lucide-react";
import { format, addMonths } from "date-fns";

interface NovoTituloAvulsoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  clinicId: string;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão Crédito" },
  { value: "cartao_debito", label: "Cartão Débito" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
  { value: "cheque", label: "Cheque" },
  { value: "convenio", label: "Convênio" },
];

export const NovoTituloAvulsoModal = ({
  open,
  onOpenChange,
  patientId,
  clinicId,
  onSuccess,
}: NovoTituloAvulsoModalProps) => {
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [installments, setInstallments] = useState("1");
  const [mode, setMode] = useState<"single" | "parcelado">("single");

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDueDate(format(new Date(), "yyyy-MM-dd"));
    setPaymentMethod("");
    setNotes("");
    setInstallments("1");
    setMode("single");
  };

  const handleSave = async () => {
    if (!description.trim()) {
      toast.error("Informe uma descrição");
      return;
    }
    const valor = parseFloat(amount.replace(",", "."));
    if (isNaN(valor) || valor <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    if (!dueDate) {
      toast.error("Informe a data de vencimento");
      return;
    }

    const numParcelas = mode === "parcelado" ? parseInt(installments) : 1;
    if (numParcelas < 1 || numParcelas > 60) {
      toast.error("Número de parcelas inválido (1-60)");
      return;
    }

    setSaving(true);
    try {
      const valorParcela = Math.round((valor / numParcelas) * 100) / 100;
      const diferenca = Math.round((valor - valorParcela * numParcelas) * 100) / 100;

      const titulos = Array.from({ length: numParcelas }, (_, i) => {
        const vencimento = addMonths(new Date(dueDate + "T12:00:00"), i);
        const valorFinal = i === 0 ? valorParcela + diferenca : valorParcela;

        return {
          patient_id: patientId,
          clinic_id: clinicId,
          amount: valorFinal,
          balance: valorFinal,
          due_date: format(vencimento, "yyyy-MM-dd"),
          status: "open",
          origin: "manual",
          notes: notes || null,
          installment_label: numParcelas > 1
            ? `${description} (${i + 1}/${numParcelas})`
            : description,
          installment_number: i + 1,
          total_installments: numParcelas,
          payment_method: paymentMethod || null,
        };
      });

      const { error } = await supabase
        .from("receivable_titles")
        .insert(titulos);

      if (error) throw error;

      toast.success(
        numParcelas > 1
          ? `${numParcelas} parcelas criadas com sucesso`
          : "Título criado com sucesso"
      );
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao criar título:", error);
      toast.error("Erro ao criar título avulso");
    } finally {
      setSaving(false);
    }
  };

  const parsedAmount = parseFloat(amount.replace(",", ".")) || 0;
  const numParcelas = mode === "parcelado" ? parseInt(installments) || 1 : 1;
  const valorParcela = numParcelas > 0 ? parsedAmount / numParcelas : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Novo Título Avulso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Descrição *</Label>
            <Input
              placeholder="Ex: Consulta particular, Material extra..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor Total (R$) *</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Vencimento *</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modo: Único ou Parcelado */}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "single" ? "default" : "outline"}
              onClick={() => { setMode("single"); setInstallments("1"); }}
              className="flex-1"
            >
              Parcela Única
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "parcelado" ? "default" : "outline"}
              onClick={() => setMode("parcelado")}
              className="flex-1"
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Parcelar
            </Button>
          </div>

          {mode === "parcelado" && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div>
                <Label>Nº de Parcelas</Label>
                <Input
                  type="number"
                  min="2"
                  max="60"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                />
              </div>
              {parsedAmount > 0 && numParcelas > 1 && (
                <p className="text-sm text-muted-foreground">
                  {numParcelas}x de{" "}
                  <span className="font-semibold text-foreground">
                    R$ {valorParcela.toFixed(2).replace(".", ",")}
                  </span>
                  {" "}• Vencimentos mensais a partir de {format(new Date(dueDate + "T12:00:00"), "dd/MM/yyyy")}
                </p>
              )}
            </div>
          )}

          <div>
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações internas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === "parcelado" && numParcelas > 1
              ? `Criar ${numParcelas} parcelas`
              : "Criar Título"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
