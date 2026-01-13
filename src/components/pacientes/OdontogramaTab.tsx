import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaceOclusal, FaceStatus } from "@/components/odontograma/FaceOclusal";
import { DenteVestibular } from "@/components/odontograma/DenteVestibular";
import { ProcedimentosTable } from "@/components/odontograma/ProcedimentosTable";

interface OdontogramaTabProps {
  patientId: string;
  onAddProcedimento?: () => void;
}

// Dentes permanentes FDI
const DENTES_PERMANENTES = {
  superior: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  inferior: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
};

// Dentes decíduos
const DENTES_DECIDUOS = {
  superior: [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
  inferior: [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
};

interface DenteData {
  faces: {
    vestibular: FaceStatus;
    mesial: FaceStatus;
    distal: FaceStatus;
    oclusal: FaceStatus;
    palatina: FaceStatus;
  };
  procedures: any[];
}

export const OdontogramaTab = ({ patientId, onAddProcedimento }: OdontogramaTabProps) => {
  const [denticao, setDenticao] = useState<"permanente" | "decidua">("permanente");
  const [selectedDente, setSelectedDente] = useState<number | null>(null);
  const [selectedFace, setSelectedFace] = useState<string | null>(null);
  const [dentesData, setDentesData] = useState<Record<number, DenteData>>({});
  const [loading, setLoading] = useState(true);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);

  const dentes = denticao === "permanente" ? DENTES_PERMANENTES : DENTES_DECIDUOS;

  useEffect(() => {
    loadDentalData();
  }, [patientId]);

  const loadDentalData = async () => {
    try {
      setLoading(false);

      const { data: budgets, error: budgetsError } = await supabase
        .from("budgets")
        .select("id")
        .eq("patient_id", patientId);

      if (budgetsError) throw budgetsError;

      if (budgets && budgets.length > 0) {
        const budgetIds = budgets.map(b => b.id);
        
        const { data: items, error: itemsError } = await supabase
          .from("budget_items")
          .select("*")
          .in("budget_id", budgetIds)
          .not("tooth_number", "is", null);

        if (itemsError) throw itemsError;
        setBudgetItems(items || []);

        // Mapear dados por dente
        const dataMap: Record<number, DenteData> = {};
        
        (items || []).forEach((item: any) => {
          if (!item.tooth_number) return;
          
          const dentesArr = item.tooth_number.split(",").map((d: string) => parseInt(d.trim()));
          const faces = item.tooth_faces?.split(",").map((f: string) => f.trim().toLowerCase()) || [];
          
          // Mapear status do tratamento para status visual
          const getVisualStatus = (treatmentStatus: string): FaceStatus => {
            switch (treatmentStatus) {
              case "completed": return "executado";
              case "in_progress": return "existente";
              case "pending": 
              default: return "a_realizar";
            }
          };
          
          dentesArr.forEach((denteNum: number) => {
            if (!dataMap[denteNum]) {
              dataMap[denteNum] = {
                faces: {
                  vestibular: null,
                  mesial: null,
                  distal: null,
                  oclusal: null,
                  palatina: null,
                },
                procedures: []
              };
            }
            
            dataMap[denteNum].procedures.push(item);
            
            // Atualizar status das faces
            const status = getVisualStatus(item.treatment_status);
            faces.forEach((face: string) => {
              const faceKey = face.charAt(0).toLowerCase();
              if (faceKey === 'v') dataMap[denteNum].faces.vestibular = status;
              if (faceKey === 'm') dataMap[denteNum].faces.mesial = status;
              if (faceKey === 'd') dataMap[denteNum].faces.distal = status;
              if (faceKey === 'o' || faceKey === 'i') dataMap[denteNum].faces.oclusal = status;
              if (faceKey === 'p' || faceKey === 'l') dataMap[denteNum].faces.palatina = status;
            });
            
            // Se não tem faces específicas, marca a oclusal
            if (faces.length === 0) {
              dataMap[denteNum].faces.oclusal = status;
            }
          });
        });

        setDentesData(dataMap);
      }

    } catch (error: any) {
      console.error("Erro ao carregar dados do odontograma:", error);
      toast.error("Erro ao carregar dados do odontograma");
    } finally {
      setLoading(false);
    }
  };

  const handleDenteClick = (dente: number) => {
    setSelectedDente(selectedDente === dente ? null : dente);
    setSelectedFace(null);
  };

  const handleFaceClick = (dente: number, face: string) => {
    setSelectedDente(dente);
    setSelectedFace(face);
  };

  const getDefaultFaces = () => ({
    vestibular: null as FaceStatus,
    mesial: null as FaceStatus,
    distal: null as FaceStatus,
    oclusal: null as FaceStatus,
    palatina: null as FaceStatus,
  });

  // Preparar procedimentos para a tabela
  const procedimentosTabela = budgetItems.map(item => ({
    id: item.id,
    date: item.created_at,
    dente: item.tooth_number || "-",
    nome: item.procedure_name,
    status: item.treatment_status === "completed" ? "executado" as const : 
           item.treatment_status === "in_progress" ? "existente" as const : "a_realizar" as const,
    faces: item.tooth_faces,
    valor: item.total_price,
  }));

  const getVestibularStatus = (dente: number): FaceStatus => {
    const data = dentesData[dente];
    if (!data) return null;
    // Retorna o status mais grave das faces
    const statuses = Object.values(data.faces).filter(Boolean);
    if (statuses.includes("a_realizar")) return "a_realizar";
    if (statuses.includes("existente")) return "existente";
    if (statuses.includes("executado")) return "executado";
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando odontograma...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Odontograma Principal */}
      <div className="flex-1 space-y-4">
        {/* Header com Dentição + Legenda */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Select 
              value={denticao} 
              onValueChange={(v) => setDenticao(v as "permanente" | "decidua")}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Dentição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanente">Permanente</SelectItem>
                <SelectItem value="decidua">Decídua</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Legenda */}
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium text-muted-foreground">Legenda</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <span className="text-xs">A realizar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span className="text-xs">Executado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              <span className="text-xs">Existente</span>
            </div>
          </div>
        </div>

        {/* Odontograma Visual */}
        <div className="border rounded-lg p-4 bg-card">
          {/* Arcada Superior */}
          <div className="space-y-1">
            {/* Vestibular Superior */}
            <div className="flex items-center">
              <span className="w-20 text-xs text-muted-foreground">Vestibular</span>
              <div className="flex gap-0.5 justify-center flex-1">
                {dentes.superior.map(dente => (
                  <DenteVestibular
                    key={`vest-sup-${dente}`}
                    numero={dente}
                    status={getVestibularStatus(dente)}
                    onClick={() => handleDenteClick(dente)}
                    arcada="superior"
                  />
                ))}
              </div>
            </div>

            {/* Oclusal Superior */}
            <div className="flex items-center">
              <span className="w-20 text-xs text-muted-foreground">Oclusal</span>
              <div className="flex gap-0.5 justify-center flex-1">
                {dentes.superior.map(dente => (
                  <FaceOclusal
                    key={`ocl-sup-${dente}`}
                    numero={dente}
                    faces={dentesData[dente]?.faces || getDefaultFaces()}
                    onFaceClick={(face) => handleFaceClick(dente, face)}
                    selected={selectedDente === dente}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            {/* Palatina Superior */}
            <div className="flex items-center">
              <span className="w-20 text-xs text-muted-foreground">Palatina</span>
              <div className="flex gap-0.5 justify-center flex-1">
                {dentes.superior.map(dente => (
                  <DenteVestibular
                    key={`pal-sup-${dente}`}
                    numero={dente}
                    status={dentesData[dente]?.faces.palatina || null}
                    onClick={() => handleDenteClick(dente)}
                    arcada="inferior"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Numeração Central */}
          <div className="my-4 border-t border-b py-2">
            <div className="flex items-center">
              <span className="w-20"></span>
              <div className="flex gap-0.5 justify-center flex-1">
                {dentes.superior.map(dente => (
                  <div 
                    key={`num-sup-${dente}`} 
                    className={cn(
                      "w-6 text-center text-xs font-mono",
                      selectedDente === dente ? "font-bold text-primary" : "text-muted-foreground"
                    )}
                  >
                    {dente}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center mt-1">
              <span className="w-20"></span>
              <div className="flex gap-0.5 justify-center flex-1">
                {dentes.inferior.map(dente => (
                  <div 
                    key={`num-inf-${dente}`} 
                    className={cn(
                      "w-6 text-center text-xs font-mono",
                      selectedDente === dente ? "font-bold text-primary" : "text-muted-foreground"
                    )}
                  >
                    {dente}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arcada Inferior */}
          <div className="space-y-1">
            {/* Lingual Inferior */}
            <div className="flex items-center">
              <span className="w-20 text-xs text-muted-foreground">Lingual</span>
              <div className="flex gap-0.5 justify-center flex-1">
                {dentes.inferior.map(dente => (
                  <DenteVestibular
                    key={`ling-inf-${dente}`}
                    numero={dente}
                    status={dentesData[dente]?.faces.palatina || null}
                    onClick={() => handleDenteClick(dente)}
                    arcada="superior"
                  />
                ))}
              </div>
            </div>

            {/* Oclusal Inferior */}
            <div className="flex items-center">
              <span className="w-20 text-xs text-muted-foreground">Oclusal</span>
              <div className="flex gap-0.5 justify-center flex-1">
                {dentes.inferior.map(dente => (
                  <FaceOclusal
                    key={`ocl-inf-${dente}`}
                    numero={dente}
                    faces={dentesData[dente]?.faces || getDefaultFaces()}
                    onFaceClick={(face) => handleFaceClick(dente, face)}
                    selected={selectedDente === dente}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            {/* Vestibular Inferior */}
            <div className="flex items-center">
              <span className="w-20 text-xs text-muted-foreground">Vestibular</span>
              <div className="flex gap-0.5 justify-center flex-1">
                {dentes.inferior.map(dente => (
                  <DenteVestibular
                    key={`vest-inf-${dente}`}
                    numero={dente}
                    status={getVestibularStatus(dente)}
                    onClick={() => handleDenteClick(dente)}
                    arcada="inferior"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Painel de Procedimentos */}
      <div className="w-[340px] shrink-0">
        <ProcedimentosTable
          procedimentos={procedimentosTabela}
          onAddProcedimento={onAddProcedimento}
          onPrint={() => window.print()}
        />
      </div>
    </div>
  );
};
