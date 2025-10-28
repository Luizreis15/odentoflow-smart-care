import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Smartphone } from "lucide-react";

interface TipoAtestadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTipo: (tipo: "impresso" | "digital") => void;
}

export const TipoAtestadoModal = ({
  open,
  onOpenChange,
  onSelectTipo,
}: TipoAtestadoModalProps) => {
  const handleSelect = (tipo: "impresso" | "digital") => {
    onSelectTipo(tipo);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tipo de Atestado</DialogTitle>
          <DialogDescription>
            Selecione se o atestado será impresso ou digital
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-6">
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-3"
            onClick={() => handleSelect("impresso")}
          >
            <Printer className="h-12 w-12" />
            <span className="font-semibold">Impresso</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-3"
            onClick={() => handleSelect("digital")}
          >
            <Smartphone className="h-12 w-12" />
            <span className="font-semibold">Digital</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
