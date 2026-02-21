import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ConsultaManutencaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  casoId: string | null;
  tipoTratamento: string;
  onSuccess: () => void;
}

export function ConsultaManutencaoModal({ open, onOpenChange, casoId, tipoTratamento, onSuccess }: ConsultaManutencaoModalProps) {
  const [loading, setLoading] = useState(false);
  const [dataConsulta, setDataConsulta] = useState(new Date().toISOString().split("T")[0]);
  const [tipoConsulta, setTipoConsulta] = useState("ativacao");
  const [professionalId, setProfessionalId] = useState("");
  const [fioUtilizado, setFioUtilizado] = useState("");
  const [elasticos, setElasticos] = useState("");
  const [numeroAlinhador, setNumeroAlinhador] = useState("");
  const [procedimentos, setProcedimentos] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [proximaConsulta, setProximaConsulta] = useState("");

  const { data: professionals } = useQuery({
    queryKey: ["professionals-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setDataConsulta(new Date().toISOString().split("T")[0]);
    setTipoConsulta("ativacao");
    setProfessionalId("");
    setFioUtilizado("");
    setElasticos("");
    setNumeroAlinhador("");
    setProcedimentos("");
    setObservacoes("");
    setProximaConsulta("");
  };

  const handleSubmit = async () => {
    if (!casoId || !professionalId) {
      toast.error("Selecione o profissional");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("ortho_appointments").insert({
        case_id: casoId,
        data_consulta: dataConsulta,
        tipo_consulta: tipoConsulta,
        professional_id: professionalId,
        fio_utilizado: fioUtilizado || null,
        elasticos: elasticos || null,
        numero_alinhador: numeroAlinhador ? parseInt(numeroAlinhador) : null,
        procedimentos_realizados: procedimentos || null,
        observacoes: observacoes || null,
        proxima_consulta_prevista: proximaConsulta || null,
      });

      if (error) throw error;

      toast.success("Consulta registrada com sucesso!");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error("Erro ao registrar consulta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAlinhadores = tipoTratamento === "alinhadores";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Consulta de Manutenção</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data da Consulta *</Label>
              <Input type="date" value={dataConsulta} onChange={(e) => setDataConsulta(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Consulta *</Label>
              <Select value={tipoConsulta} onValueChange={setTipoConsulta}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativacao">Ativação</SelectItem>
                  <SelectItem value="colagem">Colagem</SelectItem>
                  <SelectItem value="troca_fio">Troca de Fio</SelectItem>
                  {isAlinhadores && <SelectItem value="troca_alinhador">Troca de Alinhador</SelectItem>}
                  <SelectItem value="emergencia">Emergência</SelectItem>
                  <SelectItem value="documentacao">Documentação</SelectItem>
                  <SelectItem value="moldagem">Moldagem</SelectItem>
                  <SelectItem value="contencao">Contenção</SelectItem>
                  <SelectItem value="remocao">Remoção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profissional *</Label>
            <Select value={professionalId} onValueChange={setProfessionalId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isAlinhadores && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fio Utilizado</Label>
                <Input
                  value={fioUtilizado}
                  onChange={(e) => setFioUtilizado(e.target.value)}
                  placeholder="Ex: NiTi .014, Aço .019x.025"
                />
              </div>
              <div className="space-y-2">
                <Label>Elásticos</Label>
                <Input
                  value={elasticos}
                  onChange={(e) => setElasticos(e.target.value)}
                  placeholder="Ex: Classe II 3/16"
                />
              </div>
            </div>
          )}

          {isAlinhadores && (
            <div className="space-y-2">
              <Label>Nº do Alinhador</Label>
              <Input
                type="number"
                value={numeroAlinhador}
                onChange={(e) => setNumeroAlinhador(e.target.value)}
                placeholder="Ex: 12"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Procedimentos Realizados</Label>
            <Textarea
              value={procedimentos}
              onChange={(e) => setProcedimentos(e.target.value)}
              placeholder="Descreva os procedimentos..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas adicionais..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Próxima Consulta Prevista</Label>
            <Input type="date" value={proximaConsulta} onChange={(e) => setProximaConsulta(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Registrar Consulta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
