import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Trash2, Eye, Loader2, Printer, FileSignature } from "lucide-react";

interface HistoricoDocumentosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  documentType: string | null;
}

interface Document {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  signed_at: string | null;
}

const statusColors: Record<string, string> = {
  rascunho: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  finalizado: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  assinado: "bg-green-500/10 text-green-700 dark:text-green-400",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  finalizado: "Finalizado",
  assinado: "Assinado",
};

export const HistoricoDocumentosModal = ({
  open,
  onOpenChange,
  patientId,
  documentType,
}: HistoricoDocumentosModalProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    if (open && documentType) {
      loadDocuments();
    }
  }, [open, documentType, patientId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("patient_documents")
        .select("id, title, content, status, created_at, signed_at")
        .eq("patient_id", patientId)
        .eq("document_type", documentType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar documentos:", error);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Deseja realmente excluir este documento?")) return;

    try {
      const { error } = await supabase
        .from("patient_documents")
        .delete()
        .eq("id", docId);

      if (error) throw error;

      toast.success("Documento excluído com sucesso");
      loadDocuments();
    } catch (error: any) {
      console.error("Erro ao excluir documento:", error);
      toast.error("Erro ao excluir documento");
    }
  };

  const handleView = (doc: Document) => {
    setSelectedDoc(doc);
    setViewMode(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSign = async (docId: string) => {
    try {
      const { error } = await supabase
        .from("patient_documents")
        .update({
          status: "assinado",
          signed_at: new Date().toISOString(),
        })
        .eq("id", docId);

      if (error) throw error;

      toast.success("Documento assinado com sucesso");
      loadDocuments();
    } catch (error: any) {
      console.error("Erro ao assinar documento:", error);
      toast.error("Erro ao assinar documento");
    }
  };

  const handlePrintDoc = (doc: Document) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Formatação especial para receituários e atestados
      const isReceituario = doc.title.toLowerCase().includes('receituário') || doc.title.toLowerCase().includes('receituario');
      const isAtestado = doc.title.toLowerCase().includes('atestado');
      const needsSpecialFormat = isReceituario || isAtestado;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.title}</title>
            <style>
              @media print {
                @page {
                  margin: 2cm;
                }
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              body { 
                font-family: Arial, sans-serif; 
                padding: ${needsSpecialFormat ? '20px' : '40px'}; 
                line-height: 1.6;
                color: #000;
                max-width: 800px;
                margin: 0 auto;
              }
              h1 { 
                font-size: 24px; 
                margin-bottom: 20px; 
                text-align: ${needsSpecialFormat ? 'center' : 'left'};
                border-bottom: ${needsSpecialFormat ? '2px solid #000' : 'none'};
                padding-bottom: ${needsSpecialFormat ? '10px' : '0'};
              }
              .content { 
                white-space: pre-wrap; 
                line-height: 1.8;
                font-size: ${needsSpecialFormat ? '12pt' : '11pt'};
              }
              .meta { 
                color: #666; 
                margin-bottom: 20px; 
                font-size: 14px; 
              }
              ${needsSpecialFormat ? `
              .signature-area {
                margin-top: 80px;
                text-align: center;
              }
              .signature-line {
                border-top: 1px solid #000;
                width: 300px;
                margin: 60px auto 10px;
              }
              @media print {
                button {
                  display: none;
                }
              }
              ` : ''}
            </style>
          </head>
          <body>
            <h1>${doc.title}</h1>
            <div class="meta">Criado em ${format(new Date(doc.created_at), "dd/MM/yyyy 'às' HH:mm")}</div>
            ${doc.signed_at ? `<div class="meta" style="color: green;">Assinado em ${format(new Date(doc.signed_at), "dd/MM/yyyy 'às' HH:mm")}</div>` : ''}
            <div class="content">${doc.content.replace(/\n/g, '<br>')}</div>
            ${needsSpecialFormat ? `
            <div class="signature-area">
              <div class="signature-line"></div>
              <p>Assinatura do Profissional</p>
            </div>
            ` : ''}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 250);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (viewMode && selectedDoc) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setViewMode(false);
          setSelectedDoc(null);
        }
        onOpenChange(isOpen);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedDoc.title}</DialogTitle>
              <Badge className={statusColors[selectedDoc.status]}>
                {statusLabels[selectedDoc.status]}
              </Badge>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] space-y-4 px-1">
            <div className="text-sm text-muted-foreground">
              Criado em {format(new Date(selectedDoc.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </div>

            <div className="whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
              {selectedDoc.content}
            </div>

            {selectedDoc.signed_at && (
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                Assinado em {format(new Date(selectedDoc.signed_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setViewMode(false);
                setSelectedDoc(null);
              }}
            >
              Voltar
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            {selectedDoc.status !== "assinado" && (
              <Button onClick={() => handleSign(selectedDoc.id)}>
                <FileSignature className="h-4 w-4 mr-2" />
                Assinar Documento
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Histórico de Documentos</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] space-y-3 px-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Nenhum documento encontrado
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold truncate">{doc.title}</h4>
                        <Badge className={statusColors[doc.status]}>
                          {statusLabels[doc.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Criado em {format(new Date(doc.created_at), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                      {doc.signed_at && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Assinado em {format(new Date(doc.signed_at), "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(doc)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintDoc(doc)}
                        title="Imprimir"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      {doc.status !== "assinado" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSign(doc.id)}
                          title="Assinar"
                        >
                          <FileSignature className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(doc.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
