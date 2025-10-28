import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

interface ImportProcedimentosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ImportProcedimentosModal = ({
  open,
  onOpenChange,
  onSuccess,
}: ImportProcedimentosModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (ext === "csv" || ext === "xlsx") {
        setFile(selectedFile);
      } else {
        toast.error("Formato inválido. Use CSV ou XLSX");
      }
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter(l => l.trim());
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    
    const data = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const obj: any = {};
      
      headers.forEach((header, idx) => {
        if (header.includes("codigo") || header.includes("código")) {
          obj.codigo_sistema = values[idx];
        } else if (header.includes("especialidade")) {
          obj.especialidade = values[idx];
        } else if (header.includes("descri") || header.includes("descrição")) {
          obj.descricao = values[idx];
        } else if (header.includes("valor") || header.includes("preço") || header.includes("preco")) {
          obj.valor = parseFloat(values[idx].replace(/[^\d.,]/g, "").replace(",", "."));
        }
      });
      
      return obj;
    });

    return data.filter(d => d.codigo_sistema && d.especialidade && d.descricao && d.valor);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Selecione um arquivo");
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      const procedimentos = parseCSV(text);

      if (procedimentos.length === 0) {
        toast.error("Nenhum procedimento válido encontrado no arquivo");
        setLoading(false);
        return;
      }

      // Validar formato
      const hasRequiredFields = procedimentos.every(
        p => p.codigo_sistema && p.especialidade && p.descricao && p.valor
      );

      if (!hasRequiredFields) {
        toast.error("Arquivo com formato inválido. Certifique-se de ter: codigo_sistema, especialidade, descricao, valor");
        setLoading(false);
        return;
      }

      // Inserir ou atualizar procedimentos
      let inserted = 0;
      let updated = 0;

      for (const proc of procedimentos) {
        const { data: existing } = await supabase
          .from("procedimentos")
          .select("id")
          .eq("codigo_sistema", proc.codigo_sistema)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("procedimentos")
            .update({
              especialidade: proc.especialidade,
              descricao: proc.descricao,
              valor: proc.valor,
            })
            .eq("id", existing.id);
          updated++;
        } else {
          await supabase
            .from("procedimentos")
            .insert(proc);
          inserted++;
        }
      }

      toast.success(`Importação concluída: ${inserted} novos, ${updated} atualizados`);
      onSuccess();
      onOpenChange(false);
      setFile(null);
    } catch (error) {
      console.error("Erro ao importar:", error);
      toast.error("Erro ao importar arquivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Tabela de Procedimentos</DialogTitle>
          <DialogDescription>
            Envie um arquivo CSV ou XLSX com os procedimentos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Formato esperado:</strong>
              <br />
              Colunas: Código, Especialidade, Descrição, Valor
              <br />
              Se o código já existir, o procedimento será atualizado
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                disabled={loading}
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading ? "Importando..." : "Importar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
