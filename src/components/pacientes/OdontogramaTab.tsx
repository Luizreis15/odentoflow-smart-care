import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Info, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface OdontogramaTabProps {
  patientId: string;
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

interface DenteStatus {
  dente: string;
  status: "pending" | "in_progress" | "completed";
  procedures: string[];
}

interface ToothIconProps {
  number: number;
  status?: DenteStatus;
  onClick: () => void;
  selected: boolean;
}

const ToothIcon = ({ number, status, onClick, selected }: ToothIconProps) => {
  const getStatusColor = () => {
    if (selected) return "fill-primary stroke-primary";
    switch (status?.status) {
      case "completed": return "fill-green-500 stroke-green-600";
      case "in_progress": return "fill-yellow-500 stroke-yellow-600";
      case "pending": return "fill-orange-400 stroke-orange-500";
      default: return "fill-muted stroke-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-1">{number}</span>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative w-10 h-12 transition-all hover:scale-110 group",
          selected && "scale-110"
        )}
        title={status ? `${status.procedures.length} procedimento(s)` : "Sem procedimentos"}
      >
        <svg
          viewBox="0 0 24 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "w-full h-full transition-all",
            selected ? "drop-shadow-lg" : "opacity-70 group-hover:opacity-100"
          )}
        >
          <path
            d="M12 2C8 2 4 4 4 8C4 10 4 14 4 18C4 22 6 30 12 30C18 30 20 22 20 18C20 14 20 10 20 8C20 4 16 2 12 2Z"
            className={cn("transition-all", getStatusColor())}
            strokeWidth="2"
          />
          <path
            d="M10 8C10 8 10 12 10 14M14 8C14 8 14 12 14 14"
            className={cn(
              "transition-all",
              selected ? "stroke-primary-foreground" : "stroke-muted-foreground"
            )}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {status && status.procedures.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {status.procedures.length}
          </span>
        )}
      </button>
    </div>
  );
};

export const OdontogramaTab = ({ patientId }: OdontogramaTabProps) => {
  const [activeTab, setActiveTab] = useState("permanentes");
  const [selectedDente, setSelectedDente] = useState<number | null>(null);
  const [dentesStatus, setDentesStatus] = useState<Record<string, DenteStatus>>({});
  const [loading, setLoading] = useState(true);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);

  useEffect(() => {
    loadDentalData();
  }, [patientId]);

  const loadDentalData = async () => {
    try {
      setLoading(true);

      // Carregar budget_items do paciente para mapear procedimentos por dente
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

        // Mapear status por dente
        const statusMap: Record<string, DenteStatus> = {};
        
        (items || []).forEach((item: any) => {
          if (!item.tooth_number) return;
          
          // Pode haver múltiplos dentes separados por vírgula
          const dentes = item.tooth_number.split(",").map((d: string) => d.trim());
          
          dentes.forEach((dente: string) => {
            if (!statusMap[dente]) {
              statusMap[dente] = {
                dente,
                status: item.treatment_status || "pending",
                procedures: []
              };
            }
            statusMap[dente].procedures.push(item.procedure_name);
            
            // Atualizar status baseado no pior caso
            const currentStatus = statusMap[dente].status;
            if (item.treatment_status === "pending" && currentStatus !== "pending") {
              statusMap[dente].status = "pending";
            } else if (item.treatment_status === "in_progress" && currentStatus === "completed") {
              statusMap[dente].status = "in_progress";
            }
          });
        });

        setDentesStatus(statusMap);
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
  };

  const selectedDenteInfo = selectedDente ? dentesStatus[selectedDente.toString()] : null;
  const procedimentosDoDente = selectedDente 
    ? budgetItems.filter(item => 
        item.tooth_number?.split(",").map((d: string) => d.trim()).includes(selectedDente.toString())
      )
    : [];

  const renderArcada = (dentes: number[], label: string) => (
    <div className="space-y-2">
      <div className="flex justify-center gap-1">
        {dentes.map(dente => (
          <ToothIcon
            key={dente}
            number={dente}
            status={dentesStatus[dente.toString()]}
            onClick={() => handleDenteClick(dente)}
            selected={selectedDente === dente}
          />
        ))}
      </div>
    </div>
  );

  // Estatísticas
  const totalDentes = Object.keys(dentesStatus).length;
  const dentesConcluidos = Object.values(dentesStatus).filter(d => d.status === "completed").length;
  const dentesEmTratamento = Object.values(dentesStatus).filter(d => d.status === "in_progress").length;
  const dentesPendentes = Object.values(dentesStatus).filter(d => d.status === "pending").length;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Carregando odontograma...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{totalDentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-xl font-bold text-green-600">{dentesConcluidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em tratamento</p>
                <p className="text-xl font-bold text-yellow-600">{dentesEmTratamento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold text-orange-600">{dentesPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Odontograma Visual */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Odontograma</CardTitle>
            <p className="text-sm text-muted-foreground">
              Clique em um dente para ver os procedimentos associados
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="permanentes">Permanentes</TabsTrigger>
                <TabsTrigger value="deciduos">Decíduos</TabsTrigger>
              </TabsList>

              <TabsContent value="permanentes" className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center mb-3">Arcada Superior</p>
                  {renderArcada(DENTES_PERMANENTES.superior, "Superior")}
                </div>
                
                <div className="border-t my-2" />
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center mb-3">Arcada Inferior</p>
                  {renderArcada(DENTES_PERMANENTES.inferior, "Inferior")}
                </div>
              </TabsContent>

              <TabsContent value="deciduos" className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center mb-3">Arcada Superior</p>
                  {renderArcada(DENTES_DECIDUOS.superior, "Superior")}
                </div>
                
                <div className="border-t my-2" />
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center mb-3">Arcada Inferior</p>
                  {renderArcada(DENTES_DECIDUOS.inferior, "Inferior")}
                </div>
              </TabsContent>
            </Tabs>

            {/* Legenda */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-muted border border-muted-foreground/30" />
                <span className="text-xs text-muted-foreground">Sem procedimento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-400" />
                <span className="text-xs text-muted-foreground">Pendente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-xs text-muted-foreground">Em tratamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Concluído</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Painel de Detalhes do Dente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDente ? `Dente ${selectedDente}` : "Detalhes do Dente"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDente ? (
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione um dente no odontograma para ver os procedimentos
                </p>
              </div>
            ) : procedimentosDoDente.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum procedimento registrado para este dente
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {procedimentosDoDente.map((item, index) => (
                  <div key={item.id || index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.procedure_name}</p>
                        {item.procedure_code && (
                          <p className="text-xs text-muted-foreground">
                            Código: {item.procedure_code}
                          </p>
                        )}
                        {item.tooth_faces && (
                          <p className="text-xs text-muted-foreground">
                            Faces: {item.tooth_faces}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant="outline"
                        className={cn(
                          item.treatment_status === "completed" && "border-green-500 text-green-600",
                          item.treatment_status === "in_progress" && "border-yellow-500 text-yellow-600",
                          item.treatment_status === "pending" && "border-orange-500 text-orange-600"
                        )}
                      >
                        {item.treatment_status === "completed" ? "Concluído" :
                         item.treatment_status === "in_progress" ? "Em andamento" : "Pendente"}
                      </Badge>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm font-medium">
                        {item.total_price?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
