import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EntradaEstoqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntradaEstoqueModal({ open, onOpenChange }: EntradaEstoqueModalProps) {
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Entrada de Estoque</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
