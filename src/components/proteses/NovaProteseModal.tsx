import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LaboratorioModal } from "./LaboratorioModal";
import { Plus } from "lucide-react";

const TIPOS_PROCEDIMENTO = [
  "Coroas",
  "Prótese Parcial Removível",
  "Prótese Total",
  "Facetas / Lentes",
  "Onlay / Inlay",
  "Pivô",
  "Barra / Overdenture",
  "Implante – Protetização",
  "Outro",
];

interface NovaProteseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NovaProteseModal({
  open,
  onOpenChange,
  onSuccess,
}: NovaProteseModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("paciente");

  const [formData, setFormData] = useState({
    paciente_id: "",
    profissional_id: "",
    procedimento_tipo: "",
    procedimento_nome: "",
    tipo_laboratorio: "externo",
    laboratorio_id: "",
    data_envio_prevista: "",
    data_entrega_prevista: "",
    data_instalacao_prevista: "",
    custo_laboratorial: "",
    forma_pagamento: "",
    observacoes: "",
  });

  const { data: pacientes } = useQuery({
    queryKey: ["patients-select"],
    queryFn: async () => {
      const { data } = await supabase
        .from("patients")
        .select("id, full_name")
        .order("full_name");
      return data || [];
    },
  });

  const { data: profissionais } = useQuery({
    queryKey: ["profissionais-select"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profissionais")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      return data || [];
    },
  });

  const { data: laboratorios, refetch: refetchLabs } = useQuery({
    queryKey: ["laboratorios-select"],
    queryFn: async () => {
      const { data } = await supabase
        .from("laboratorios")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      return data || [];
    },
  });

  const handleSubmit = async () => {
    if (!formData.paciente_id || !formData.profissional_id || !formData.procedimento_nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha paciente, profissional e procedimento",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: profile } = await supabase.from("profiles").select("clinic_id").single();

      // Criar prótese
      const { data: protese, error: proteseError } = await supabase
        .from("proteses")
        .insert({
          clinica_id: profile?.clinic_id,
          paciente_id: formData.paciente_id,
          profissional_id: formData.profissional_id,
          procedimento_tipo: formData.procedimento_tipo,
          procedimento_nome: formData.procedimento_nome,
          tipo_laboratorio: formData.tipo_laboratorio as "interno" | "externo",
          laboratorio_id: formData.laboratorio_id || null,
          data_envio_prevista: formData.data_envio_prevista || null,
          data_entrega_prevista: formData.data_entrega_prevista || null,
          data_instalacao_prevista: formData.data_instalacao_prevista || null,
          custo_laboratorial: formData.custo_laboratorial ? parseFloat(formData.custo_laboratorial) : null,
          forma_pagamento: formData.forma_pagamento || null,
          observacoes: formData.observacoes || null,
        })
        .select()
        .single();

      if (proteseError) throw proteseError;

      // Se tem custo, criar despesa
      if (formData.custo_laboratorial && parseFloat(formData.custo_laboratorial) > 0) {
        const { error: despesaError } = await supabase
          .from("financial_transactions")
          .insert({
            clinic_id: profile?.clinic_id,
            type: "expense",
            category: "Laboratório Protético",
            value: parseFloat(formData.custo_laboratorial),
            date: formData.data_entrega_prevista || new Date().toISOString().split("T")[0],
            reference: `Prótese - ${formData.procedimento_nome}`,
          });

        if (despesaError) throw despesaError;
      }

      toast({
        title: "Prótese criada!",
        description: "O item foi adicionado ao Kanban",
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        paciente_id: "",
        profissional_id: "",
        procedimento_tipo: "",
        procedimento_nome: "",
        tipo_laboratorio: "externo",
        laboratorio_id: "",
        data_envio_prevista: "",
        data_entrega_prevista: "",
        data_instalacao_prevista: "",
        custo_laboratorial: "",
        forma_pagamento: "",
        observacoes: "",
      });
      setCurrentTab("paciente");
    } catch (error: any) {
      toast({
        title: "Erro ao criar prótese",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Prótese</DialogTitle>
          </DialogHeader>

          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="paciente">Paciente</TabsTrigger>
              <TabsTrigger value="laboratorio">Laboratório</TabsTrigger>
              <TabsTrigger value="prazos">Prazos</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            </TabsList>

            <TabsContent value="paciente" className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente *</Label>
                <Select value={formData.paciente_id} onValueChange={(v) => setFormData({ ...formData, paciente_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Profissional Responsável *</Label>
                <Select value={formData.profissional_id} onValueChange={(v) => setFormData({ ...formData, profissional_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Procedimento *</Label>
                <Select value={formData.procedimento_tipo} onValueChange={(v) => setFormData({ ...formData, procedimento_tipo: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_PROCEDIMENTO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição do Procedimento *</Label>
                <Input
                  value={formData.procedimento_nome}
                  onChange={(e) => setFormData({ ...formData, procedimento_nome: e.target.value })}
                  placeholder="Ex: Coroa de Porcelana Elemento 11"
                />
              </div>
            </TabsContent>

            <TabsContent value="laboratorio" className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Laboratório</Label>
                <Select value={formData.tipo_laboratorio} onValueChange={(v) => setFormData({ ...formData, tipo_laboratorio: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interno">Interno</SelectItem>
                    <SelectItem value="externo">Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.tipo_laboratorio === "externo" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Laboratório</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setLabModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Novo Laboratório
                    </Button>
                  </div>
                  <Select value={formData.laboratorio_id} onValueChange={(v) => setFormData({ ...formData, laboratorio_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o laboratório" />
                    </SelectTrigger>
                    <SelectContent>
                      {laboratorios?.map((lab) => (
                        <SelectItem key={lab.id} value={lab.id}>{lab.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <TabsContent value="prazos" className="space-y-4">
              <div className="space-y-2">
                <Label>Data de Envio Prevista</Label>
                <Input
                  type="date"
                  value={formData.data_envio_prevista}
                  onChange={(e) => setFormData({ ...formData, data_envio_prevista: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Data de Entrega Prevista</Label>
                <Input
                  type="date"
                  value={formData.data_entrega_prevista}
                  onChange={(e) => setFormData({ ...formData, data_entrega_prevista: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Data de Instalação Prevista</Label>
                <Input
                  type="date"
                  value={formData.data_instalacao_prevista}
                  onChange={(e) => setFormData({ ...formData, data_instalacao_prevista: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-4">
              <div className="space-y-2">
                <Label>Custo Laboratorial (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_laboratorial}
                  onChange={(e) => setFormData({ ...formData, custo_laboratorial: e.target.value })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="ted">TED/DOC</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Salvando..." : "Criar Prótese"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LaboratorioModal
        open={labModalOpen}
        onOpenChange={setLabModalOpen}
        onSuccess={refetchLabs}
      />
    </>
  );
}
