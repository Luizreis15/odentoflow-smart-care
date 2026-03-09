import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCcw, AlertTriangle, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TitleForRenego {
  id: string;
  title_number: number;
  installment_label?: string | null;
  notes: string | null;
  installment_number: number | null;
  amount: number;
  balance: number;
  due_date: string;
  status: string;
}

interface RenegociacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titles: TitleForRenego[];
  patientId: string;
  clinicId: string;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
];

export const RenegociacaoModal = ({
  open,
  onOpenChange,
  titles,
  patientId,
  clinicId,
  onSuccess,
}: RenegociacaoModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState("");
  const [discount, setDiscount] = useState("0");
  const [entryAmount, setEntryAmount] = useState("0");
  const [entryMethod, setEntryMethod] = useState("pix");
  const [installments, setInstallments] = useState("3");
  const [installmentMethod, setInstallmentMethod] = useState("boleto");
  const [firstDueDate, setFirstDueDate] = useState(
    addMonths(new Date(), 1).toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  const originalTotal = useMemo(
    () => titles.reduce((s, t) => s + t.balance, 0),
    [titles]
  );

  const discountValue = parseFloat(discount) || 0;
  const entryValue = parseFloat(entryAmount) || 0;
  const installmentCount = parseInt(installments) || 1;
  const newTotal = Math.max(0, originalTotal - discountValue);
  const installmentTotal = Math.max(0, newTotal - entryValue);
  const installmentValue = installmentCount > 0 ? installmentTotal / installmentCount : 0;

  const previewTitles = useMemo(() => {
    const result: { label: string; dueDate: string; amount: number }[] = [];

    if (entryValue > 0) {
      result.push({
        label: "Entrada (Renegociação)",
        dueDate: new Date().toISOString().split("T")[0],
        amount: entryValue,
      });
    }

    for (let i = 0; i < installmentCount; i++) {
      const d = addMonths(new Date(firstDueDate + "T12:00:00"), i);
      const isLast = i === installmentCount - 1;
      const val = isLast
        ? Math.round((installmentTotal - Math.round((installmentTotal / installmentCount) * 100) / 100 * (installmentCount - 1)) * 100) / 100
        : Math.round((installmentTotal / installmentCount) * 100) / 100;

      result.push({
        label: `Parcela ${i + 1}/${installmentCount}`,
        dueDate: d.toISOString().split("T")[0],
        amount: val,
      });
    }

    return result;
  }, [entryValue, installmentCount, installmentTotal, firstDueDate]);

  const handleSubmit = async () => {
    if (newTotal <= 0) {
      toast.error("O novo total deve ser positivo");
      return;
    }
    if (entryValue >= newTotal) {
      toast.error("A entrada não pode ser maior ou igual ao total");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase.functions.invoke("renegotiate-titles", {
        body: {
          clinic_id: clinicId,
          patient_id: patientId,
          created_by: user?.id,
          title_ids: titles.map((t) => t.id),
          reason: reason || undefined,
          discount_amount: discountValue,
          entry_amount: entryValue,
          entry_method: entryValue > 0 ? entryMethod : undefined,
          entry_due_date: entryValue > 0 ? new Date().toISOString().split("T")[0] : undefined,
          installments: installmentCount,
          installment_method: installmentMethod,
          first_due_date: firstDueDate,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(
        `Renegociação concluída! ${data.new_titles_created} novas parcelas geradas.`
      );
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Erro na renegociação:", error);
      toast.error("Erro ao processar renegociação");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setReason("");
    setDiscount("0");
    setEntryAmount("0");
    setInstallments("3");
    setFirstDueDate(addMonths(new Date(), 1).toISOString().split("T")[0]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-primary" />
            Renegociação de Títulos
          </DialogTitle>
          <DialogDescription>
            Etapa {step} de 3 —{" "}
            {step === 1 ? "Títulos selecionados" : step === 2 ? "Novo parcelamento" : "Confirmação"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Review original titles */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-1">
                {titles.length} título(s) selecionado(s) para renegociação
              </p>
              <p className="text-2xl font-bold">{formatCurrency(originalTotal)}</p>
              <p className="text-xs text-muted-foreground">Saldo total em aberto</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {titles.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm">
                      {t.installment_label || t.notes || `Parcela ${t.installment_number}`}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(t.due_date), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">
                      {formatCurrency(t.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-1.5">
              <Label>Motivo da Renegociação (opcional)</Label>
              <Textarea
                placeholder="Ex: Dificuldade financeira temporária, renegociação acordada..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                Os títulos originais serão marcados como <strong>"Renegociado"</strong> e novos
                títulos serão criados com o novo parcelamento.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: New plan */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Discount */}
            <div className="space-y-1.5">
              <Label>Desconto (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={originalTotal - 1}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              {discountValue > 0 && (
                <p className="text-xs text-muted-foreground">
                  De {formatCurrency(originalTotal)} para {formatCurrency(newTotal)} (
                  {((discountValue / originalTotal) * 100).toFixed(1)}% desconto)
                </p>
              )}
            </div>

            <Separator />

            {/* Entry */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor de Entrada (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={newTotal - 1}
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                />
              </div>
              {entryValue > 0 && (
                <div className="space-y-1.5">
                  <Label>Forma (Entrada)</Label>
                  <Select value={entryMethod} onValueChange={setEntryMethod}>
                    <SelectTrigger>
                      <SelectValue />
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
              )}
            </div>

            <Separator />

            {/* Installments */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Parcelas</Label>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Forma (Parcelas)</Label>
                <Select value={installmentMethod} onValueChange={setInstallmentMethod}>
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-1.5">
                <Label>1º Vencimento</Label>
                <Input
                  type="date"
                  value={firstDueDate}
                  onChange={(e) => setFirstDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo original:</span>
                <span>{formatCurrency(originalTotal)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>Desconto:</span>
                  <span>-{formatCurrency(discountValue)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium">
                <span>Novo total:</span>
                <span>{formatCurrency(newTotal)}</span>
              </div>
              {entryValue > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entrada:</span>
                  <span>{formatCurrency(entryValue)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-sm font-bold text-primary">
                <span>
                  {installmentCount}x de:
                </span>
                <span>{formatCurrency(installmentValue)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">De</p>
                <p className="text-lg font-bold line-through text-muted-foreground">
                  {formatCurrency(originalTotal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {titles.length} título(s)
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary" />
              <div className="flex-1 text-right">
                <p className="text-sm text-muted-foreground">Para</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(newTotal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {previewTitles.length} novo(s) título(s)
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewTitles.map((t, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium">{t.label}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(t.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCurrency(t.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {reason && (
              <div className="text-sm">
                <span className="text-muted-foreground">Motivo: </span>
                <span>{reason}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
              Voltar
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}>
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Renegociação
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
