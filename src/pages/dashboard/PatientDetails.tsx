import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Copy, MessageCircle, MoreVertical, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NovoOrcamentoModal } from "@/components/orcamentos/NovoOrcamentoModal";

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  cpf?: string;
  rg?: string;
  email?: string;
  birth_date?: string;
  gender?: string;
  is_foreign?: boolean;
  how_found?: string;
  tags?: string[];
  responsible_name?: string;
  responsible_birth_date?: string;
  responsible_cpf?: string;
  responsible_phone?: string;
  notes?: string;
  created_at?: string;
}

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [activeTab, setActiveTab] = useState("sobre");
  const [showNovoOrcamento, setShowNovoOrcamento] = useState(false);
  const [clinicaId, setClinicaId] = useState<string>("");

  useEffect(() => {
    if (id) {
      loadPatient();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "orcamentos" && id) {
      loadBudgets();
    }
  }, [activeTab, id]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setPatient(data);
      
      // Carregar clinic_id
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("clinic_id")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setClinicaId(profile.clinic_id);
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar paciente:", error);
      toast.error("Erro ao carregar dados do paciente");
      navigate("/dashboard/prontuario");
    } finally {
      setLoading(false);
    }
  };

  const loadBudgets = async () => {
    try {
      setLoadingBudgets(true);
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar orçamentos:", error);
      toast.error("Erro ao carregar orçamentos");
    } finally {
      setLoadingBudgets(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const handleWhatsApp = () => {
    if (patient?.phone) {
      const phone = patient.phone.replace(/\D/g, "");
      window.open(`https://wa.me/55${phone}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Paciente não encontrado</p>
      </div>
    );
  }

  const patientCode = patient.created_at
    ? new Date(patient.created_at).getTime().toString().slice(-6)
    : "000000";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/prontuario")}
          className="mt-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-24 w-24">
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">
            {patient.full_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{patient.full_name}</h1>
              <p className="text-muted-foreground mt-1">
                {patient.phone} • CPF: {patient.cpf || "Não informado"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                EDITAR
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleCopyCode(patientCode)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleWhatsApp}>
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="sobre">SOBRE</TabsTrigger>
          <TabsTrigger value="orcamentos">ORÇAMENTOS</TabsTrigger>
          <TabsTrigger value="tratamentos">TRATAMENTOS</TabsTrigger>
          <TabsTrigger value="anamnese">ANAMNESE</TabsTrigger>
          <TabsTrigger value="imagens">IMAGENS</TabsTrigger>
          <TabsTrigger value="documentos">DOCUMENTOS</TabsTrigger>
          <TabsTrigger value="debitos">DÉBITOS</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <TabsContent value="sobre" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Dados pessoais</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground min-w-[180px]">Código do paciente</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{patientCode}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyCode(patientCode)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {patient.cpf && (
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground min-w-[180px]">CPF do paciente</span>
                        <span className="font-medium">{patient.cpf}</span>
                      </div>
                    )}

                    {patient.rg && (
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground min-w-[180px]">RG</span>
                        <span className="font-medium">{patient.rg}</span>
                      </div>
                    )}

                    {patient.birth_date && (
                      <>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground min-w-[180px]">Data de nascimento</span>
                          <span className="font-medium">
                            {new Date(patient.birth_date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground min-w-[180px]">Idade do paciente</span>
                          <span className="font-medium">{calculateAge(patient.birth_date)} anos</span>
                        </div>
                      </>
                    )}

                    {patient.gender && (
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground min-w-[180px]">Sexo</span>
                        <span className="font-medium">
                          {patient.gender === "masculino" ? "Masculino" : "Feminino"}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground min-w-[180px]">Celular</span>
                      <span className="font-medium">{patient.phone}</span>
                    </div>

                    {patient.email && (
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground min-w-[180px]">Email</span>
                        <span className="font-medium">{patient.email}</span>
                      </div>
                    )}

                    {patient.how_found && (
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground min-w-[180px]">Como chegou na clínica</span>
                        <span className="font-medium capitalize">{patient.how_found.replace("_", " ")}</span>
                      </div>
                    )}

                    {patient.tags && patient.tags.length > 0 && (
                      <div className="flex items-start gap-4">
                        <span className="text-muted-foreground min-w-[180px]">Etiquetas</span>
                        <div className="flex flex-wrap gap-2">
                          {patient.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {patient.responsible_name && (
                    <>
                      <Separator className="my-6" />
                      <h3 className="font-semibold mb-4">Dados do responsável</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground min-w-[180px]">Nome do responsável</span>
                          <span className="font-medium">{patient.responsible_name}</span>
                        </div>

                        {patient.responsible_cpf && (
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground min-w-[180px]">CPF</span>
                            <span className="font-medium">{patient.responsible_cpf}</span>
                          </div>
                        )}

                        {patient.responsible_birth_date && (
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground min-w-[180px]">Data de nascimento</span>
                            <span className="font-medium">
                              {new Date(patient.responsible_birth_date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        )}

                        {patient.responsible_phone && (
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground min-w-[180px]">Celular</span>
                            <span className="font-medium">{patient.responsible_phone}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {patient.notes && (
                    <>
                      <Separator className="my-6" />
                      <h3 className="font-semibold mb-4">Observações</h3>
                      <p className="text-muted-foreground">{patient.notes}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orcamentos" className="mt-0">
              {loadingBudgets ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Carregando orçamentos...</p>
                  </CardContent>
                </Card>
              ) : budgets.length === 0 ? (
                <div className="space-y-6">
                  <Button 
                    className="bg-[#4ade80] hover:bg-[#4ade80]/90"
                    onClick={() => setShowNovoOrcamento(true)}
                  >
                    NOVO ORÇAMENTO
                  </Button>

                  <Card className="border-none shadow-none">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                      {/* Empty state illustration */}
                      <div className="relative w-48 h-48 mb-4">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* Document illustration */}
                          <rect x="50" y="30" width="100" height="140" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="2" rx="4"/>
                          <rect x="60" y="50" width="80" height="8" fill="#3b82f6" rx="2"/>
                          <rect x="60" y="70" width="60" height="6" fill="#d0d0d0" rx="2"/>
                          <rect x="60" y="85" width="70" height="6" fill="#d0d0d0" rx="2"/>
                          <rect x="60" y="100" width="50" height="6" fill="#d0d0d0" rx="2"/>
                          <circle cx="90" cy="130" r="15" fill="#3b82f6" opacity="0.2"/>
                          <path d="M 85 130 L 88 133 L 95 125" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </svg>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-[#3b82f6] mb-2">
                          Crie o primeiro orçamento
                        </h3>
                        <p className="text-lg font-semibold text-[#3b82f6]">
                          para este paciente
                        </p>
                      </div>

                      <div className="max-w-2xl space-y-3 text-left">
                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-[#4ade80] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            Transforme o orçamento em <span className="font-semibold text-foreground">tratamentos e débitos</span>
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-[#4ade80] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            Orçamento especializado para <span className="font-semibold text-foreground">planejamento de HOF</span>
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-[#4ade80] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            Fácil e completo, com <span className="font-semibold text-foreground">odontograma</span> e <span className="font-semibold text-foreground">aprovação parcial</span>
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-[#4ade80] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            Orçamentos em aberto viram automaticamente <span className="font-semibold text-foreground">oportunidades</span> no menu <span className="text-[#3b82f6]">Vendas</span>
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-[#4ade80] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Acompanhe</span> os orçamentos em aberto e aprovados no menu <span className="text-[#3b82f6]">Inteligência</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <p className="text-sm text-muted-foreground">
                          💡 Dúvidas? Saiba tudo sobre{" "}
                          <a href="#" className="text-[#3b82f6] hover:underline">
                            Orçamentos
                          </a>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-6">
                    <div className="space-y-3">
                      {budgets.map((budget) => (
                        <div
                          key={budget.id}
                          className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{budget.title}</p>
                            <p className="text-sm text-muted-foreground">{budget.description}</p>
                          </div>
                          <Badge variant={budget.status === 'approved' ? 'default' : 'secondary'}>
                            {budget.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tratamentos">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum tratamento cadastrado</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="anamnese">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Anamnese não preenchida</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="imagens">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhuma imagem cadastrada</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documentos">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum documento cadastrado</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debitos">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum débito cadastrado</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mensagens */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Mensagens</h3>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Você ainda não enviou nenhuma mensagem para este paciente
                </p>
              </CardContent>
            </Card>

            {/* Comunicação */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Comunicação</h3>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Permitir o envio de:</p>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="service-messages" className="text-sm font-normal cursor-pointer">
                      Mensagens relacionadas ao serviço prestado
                    </Label>
                    <Switch id="service-messages" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketing-messages" className="text-sm font-normal cursor-pointer">
                      Campanha de marketing
                    </Label>
                    <Switch id="marketing-messages" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      {patient && clinicaId && (
        <NovoOrcamentoModal
          open={showNovoOrcamento}
          onOpenChange={setShowNovoOrcamento}
          patientId={patient.id}
          clinicaId={clinicaId}
          onSuccess={loadBudgets}
        />
      )}
    </div>
  );
};

export default PatientDetails;
