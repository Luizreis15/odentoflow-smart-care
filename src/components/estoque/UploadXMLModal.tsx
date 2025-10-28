import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UploadXMLModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadXMLModal({ open, onOpenChange }: UploadXMLModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload XML de Nota Fiscal</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
