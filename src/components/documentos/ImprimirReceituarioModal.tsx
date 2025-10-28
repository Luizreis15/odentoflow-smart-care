import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ImprimirReceituarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: any;
}

export const ImprimirReceituarioModal = ({
  open,
  onOpenChange,
  document,
}: ImprimirReceituarioModalProps) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = document?.content || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receituário - ${document?.title || 'Documento'}</title>
          <style>
            @media print {
              @page {
                margin: 2cm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: Arial, sans-serif;
              font-size: 12pt;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .content {
              margin: 20px 0;
            }
            .signature-area {
              margin-top: 60px;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 300px;
              margin: 40px auto 10px;
            }
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RECEITUÁRIO</h1>
          </div>
          <div class="content">
            <pre>${content}</pre>
          </div>
          <div class="signature-area">
            <div class="signature-line"></div>
            <p>Assinatura do Profissional</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Visualizar Receituário</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto border rounded-lg p-6 bg-white">
          <pre className="whitespace-pre-wrap text-sm font-sans">
            {document?.content}
          </pre>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
