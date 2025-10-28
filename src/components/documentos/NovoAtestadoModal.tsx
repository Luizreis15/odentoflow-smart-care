import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface NovoAtestadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  tipo: "impresso" | "digital" | null;
}

export const NovoAtestadoModal = ({
  open,
  onOpenChange,
  patientId,
  tipo,
}: NovoAtestadoModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [clinicData, setClinicData] = useState<any>(null);
  
  const [tipoAtestado, setTipoAtestado] = useState<"dias" | "presenca">("dias");
  const [dataAtestado, setDataAtestado] = useState(format(new Date(), "yyyy-MM-dd"));
  const [quantidadeDias, setQuantidadeDias] = useState("");
  const [cid, setCid] = useState("");

  useEffect(() => {
    if (open && patientId) {
      loadData();
    }
  }, [open, patientId]);

  const loadData = async () => {
    try {
      // Load patient data
      const { data: patient } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();
      
      setPatientData(patient);

      // Load professional data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", user.id)
          .single();

        if (usuario) {
          // Try to get additional professional details
          const { data: profissional } = await supabase
            .from("profissionais")
            .select("*")
            .eq("email", usuario.email)
            .single();

          setProfessionalData({
            nome: usuario.nome,
            email: usuario.email,
            cro: profissional?.cro || "Não cadastrado",
            especialidade: profissional?.especialidade || "Odontologia",
          });

          // Load clinic data
          const { data: clinica } = await supabase
            .from("clinicas")
            .select("*")
            .eq("id", usuario.clinica_id)
            .single();
          
          setClinicData(clinica);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados necessários",
        variant: "destructive",
      });
    }
  };

  const gerarConteudoAtestado = () => {
    if (!patientData || !professionalData || !clinicData) return "";

    const dataFormatada = format(new Date(dataAtestado), "dd/MM/yyyy");
    const hoje = format(new Date(), "dd/MM/yyyy");
    
    let conteudo = `ATESTADO MÉDICO ODONTOLÓGICO\n\n`;
    conteudo += `${clinicData.nome}\n`;
    if (clinicData.address?.rua) {
      conteudo += `${clinicData.address.rua}, ${clinicData.address.numero || "S/N"}\n`;
      conteudo += `${clinicData.address.cidade || ""} - ${clinicData.address.estado || ""}\n`;
    }
    if (clinicData.telefone) {
      conteudo += `Tel: ${clinicData.telefone}\n`;
    }
    conteudo += `\n${"=".repeat(60)}\n\n`;

    conteudo += `Paciente: ${patientData.full_name}\n`;
    if (patientData.cpf) {
      conteudo += `CPF: ${patientData.cpf}\n`;
    }
    if (patientData.birth_date) {
      conteudo += `Data de Nascimento: ${format(new Date(patientData.birth_date), "dd/MM/yyyy")}\n`;
    }
    if (patientData.address) {
      conteudo += `Endereço: ${patientData.address}\n`;
    }
    conteudo += `\n`;

    if (tipoAtestado === "dias") {
      conteudo += `Atesto para os devidos fins que o(a) paciente acima identificado(a) `;
      conteudo += `esteve sob meus cuidados profissionais na data de ${dataFormatada}, `;
      conteudo += `necessitando de afastamento de suas atividades por ${quantidadeDias} dia(s).\n\n`;
    } else {
      conteudo += `Atesto para os devidos fins que o(a) paciente acima identificado(a) `;
      conteudo += `compareceu à consulta odontológica nesta data (${dataFormatada}).\n\n`;
    }

    if (cid) {
      conteudo += `CID: ${cid}\n\n`;
    }

    conteudo += `\n`;
    conteudo += `${clinicData.address?.cidade || "São Paulo"}, ${hoje}\n\n`;
    conteudo += `\n\n`;
    conteudo += `${"_".repeat(50)}\n`;
    conteudo += `${professionalData.nome}\n`;
    conteudo += `${professionalData.especialidade}\n`;
    conteudo += `CRO: ${professionalData.cro}\n`;

    return conteudo;
  };

  const handleSalvar = async () => {
    if (!patientData || !professionalData) {
      toast({
        title: "Erro",
        description: "Dados do paciente ou profissional não encontrados",
        variant: "destructive",
      });
      return;
    }

    if (tipoAtestado === "dias" && !quantidadeDias) {
      toast({
        title: "Atenção",
        description: "Por favor, informe a quantidade de dias",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const content = gerarConteudoAtestado();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("patient_documents").insert({
        patient_id: patientId,
        clinic_id: patientData.clinic_id,
        document_type: "atestado",
        title: `Atestado - ${format(new Date(), "dd/MM/yyyy")}`,
        content: content,
        created_by: user?.id,
        status: "finalizado",
        signed_at: new Date().toISOString(),
        metadata: {
          tipo: tipo,
          tipo_atestado: tipoAtestado,
          data_atestado: dataAtestado,
          quantidade_dias: tipoAtestado === "dias" ? quantidadeDias : null,
          cid: cid || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Atestado criado com sucesso",
      });

      onOpenChange(false);
      
      // Reset form
      setTipoAtestado("dias");
      setDataAtestado(format(new Date(), "yyyy-MM-dd"));
      setQuantidadeDias("");
      setCid("");
    } catch (error) {
      console.error("Erro ao salvar atestado:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar atestado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tipo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Novo Atestado {tipo === "impresso" ? "Impresso" : "Digital"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Professional Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-sm text-muted-foreground">Profissional</Label>
              <p className="font-medium">{professionalData?.nome || "Carregando..."}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Inscrição no Conselho</Label>
              <p className="font-medium">{professionalData?.cro || "Não cadastrado"}</p>
            </div>
          </div>

          {/* Certificate Type */}
          <div className="space-y-3">
            <Label>Tipo de atestado</Label>
            <RadioGroup value={tipoAtestado} onValueChange={(value: any) => setTipoAtestado(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dias" id="dias" />
                <Label htmlFor="dias" className="cursor-pointer">Atestado de dias</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="presenca" id="presenca" />
                <Label htmlFor="presenca" className="cursor-pointer">Presença na consulta</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date and Days */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data do atestado*</Label>
              <Input
                id="data"
                type="date"
                value={dataAtestado}
                onChange={(e) => setDataAtestado(e.target.value)}
              />
            </div>
            
            {tipoAtestado === "dias" && (
              <div className="space-y-2">
                <Label htmlFor="dias">Quantidade de dias*</Label>
                <Input
                  id="dias"
                  type="number"
                  min="1"
                  value={quantidadeDias}
                  onChange={(e) => setQuantidadeDias(e.target.value)}
                  placeholder="Ex: 3"
                />
              </div>
            )}
          </div>

          {/* CID */}
          <div className="space-y-2">
            <Label htmlFor="cid">CID</Label>
            <Textarea
              id="cid"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              placeholder="Código Internacional de Doenças (opcional)"
              maxLength={100}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {cid.length}/100
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              FECHAR
            </Button>
            <Button onClick={handleSalvar} disabled={loading}>
              {loading ? "SALVANDO..." : "SALVAR ATESTADO"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
