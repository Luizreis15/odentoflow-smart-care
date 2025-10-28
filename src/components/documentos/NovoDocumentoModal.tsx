import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NovoDocumentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  documentType: string | null;
}

const documentTitles: Record<string, string> = {
  contrato: "Contrato",
  termo_consentimento: "Termo de Consentimento",
  receituario: "Receituário",
  atestado: "Atestado",
  personalizado: "Documento Personalizado",
};

export const NovoDocumentoModal = ({
  open,
  onOpenChange,
  patientId,
  documentType,
}: NovoDocumentoModalProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (open && documentType) {
      // Definir título padrão baseado no tipo
      const defaultTitle = documentTitles[documentType] || "Novo Documento";
      setTitle(defaultTitle);
      setContent("");
    }
  }, [open, documentType]);

  const handleSave = async (status: "rascunho" | "finalizado") => {
    if (!title.trim() || !content.trim()) {
      toast.error("Preencha o título e o conteúdo do documento");
      return;
    }

    try {
      setLoading(true);

      // Buscar clinic_id e user_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (!profile?.clinic_id) throw new Error("Clínica não encontrada");

      const { error } = await supabase
        .from("patient_documents")
        .insert({
          patient_id: patientId,
          clinic_id: profile.clinic_id,
          document_type: documentType || "personalizado",
          title: title.trim(),
          content: content.trim(),
          created_by: user.id,
          status,
        });

      if (error) throw error;

      toast.success(
        status === "rascunho"
          ? "Documento salvo como rascunho"
          : "Documento finalizado com sucesso"
      );

      onOpenChange(false);
      setTitle("");
      setContent("");
    } catch (error: any) {
      console.error("Erro ao salvar documento:", error);
      toast.error("Erro ao salvar documento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Novo {documentType ? documentTitles[documentType] : "Documento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[60vh] px-1">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Documento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do documento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo do documento..."
              className="min-h-[300px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave("rascunho")}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Rascunho"
            )}
          </Button>
          <Button onClick={() => handleSave("finalizado")} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finalizando...
              </>
            ) : (
              "Finalizar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
