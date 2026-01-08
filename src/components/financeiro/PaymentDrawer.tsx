import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, DollarSign, Calendar, User, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReceivableTitle {
  id: string;
  title_number: number;
  patient_id: string;
  budget_id: string | null;
  installment_number: number;
  total_installments: number;
  due_date: string;
  amount: number;
  balance: number;
  status: string;
  origin: string;
  payment_method: string | null;
  notes: string | null;
  patient?: {
    full_name: string;
    phone: string;
  };
}

interface CashAccount {
  id: string;
  nome: string;
  tipo: string;
}

interface PaymentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReceivableTitle;
  clinicId: string;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "transferencia", label: "Transferência Bancária" },
  { value: "boleto", label: "Boleto" },
  { value: "cheque", label: "Cheque" },
];

export const PaymentDrawer = ({ 
  open, 
  onOpenChange, 
  title, 
  clinicId, 
  onSuccess 
}: PaymentDrawerProps) => {
  const [amount, setAmount] = useState(title.balance.toString());
  const [method, setMethod] = useState(title.payment_method || "pix");
  const [cashAccountId, setCashAccountId] = useState("");
  const [notes, setNotes] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (open) {
      loadCashAccounts();
      loadUserId();
      setAmount(title.balance.toString());
    }
  }, [open, title]);

  const loadCashAccounts = async () => {
    const { data } = await supabase
      .from("caixas")
      .select("id, nome, tipo")
      .eq("clinica_id", clinicId)
      .eq("ativo", true);
    
    setCashAccounts(data || []);
    if (data && data.length > 0) {
      setCashAccountId(data[0].id);
    }
  };

  const loadUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSubmit = async () => {
    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Valor inválido");
      return;
    }

    if (paymentAmount > title.balance) {
      toast.error("Valor não pode ser maior que o saldo");
      return;
    }

    if (!method) {
      toast.error("Selecione a forma de pagamento");
      return;
    }

    setLoading(true);

    try {
      // Call edge function to record payment
      const { data, error } = await supabase.functions.invoke("record-payment", {
        body: {
          title_id: title.id,
          amount: paymentAmount,
          paid_at: paidAt,
          method: method,
          cash_account_id: cashAccountId || null,
          notes: notes || null,
          created_by: userId,
        },
      });

      if (error) {
        console.error("Error recording payment:", error);
        toast.error("Erro ao registrar pagamento");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(`Pagamento de ${formatCurrency(paymentAmount)} registrado com sucesso!`);
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao registrar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const isPartialPayment = parseFloat(amount) < title.balance;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Registrar Pagamento
          </SheetTitle>
          <SheetDescription>
            Título #{title.title_number} - Parcela {title.installment_number}/{title.total_installments}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{title.patient?.full_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Vencimento:</span>
                <div className="font-medium">{new Date(title.due_date).toLocaleDateString("pt-BR")}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Valor original:</span>
                <div className="font-medium">{formatCurrency(title.amount)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Pagamento</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={title.balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-lg font-medium"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Saldo devedor:</span>
              <span className="font-medium">{formatCurrency(title.balance)}</span>
            </div>
            {isPartialPayment && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Pagamento parcial - restará {formatCurrency(title.balance - parseFloat(amount || "0"))}
              </div>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="paidAt">Data do Pagamento</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="paidAt"
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <CreditCard className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {pm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cash Account */}
          {cashAccounts.length > 0 && (
            <div className="space-y-2">
              <Label>Conta/Caixa de Destino</Label>
              <Select value={cashAccountId} onValueChange={setCashAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o caixa..." />
                </SelectTrigger>
                <SelectContent>
                  {cashAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.nome} ({account.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o pagamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              "Processando..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Pagamento
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
