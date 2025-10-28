import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SaidaEstoqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaidaEstoqueModal({ open, onOpenChange }: SaidaEstoqueModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Saída de Estoque</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
