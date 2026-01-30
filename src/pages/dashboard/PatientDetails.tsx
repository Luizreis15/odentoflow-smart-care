import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Edit, Copy, MessageCircle, MoreVertical, 
  Phone, Mail, Trash2, Printer, Send, Link2, 
  User, Phone as PhoneIcon, FileText, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NovoOrcamentoModal } from "@/components/orcamentos/NovoOrcamentoModal";
import { TratamentosTab } from "@/components/tratamentos/TratamentosTab";
import { OrcamentosTab } from "@/components/orcamentos/OrcamentosTab";
import AnamnesesTab from "@/components/anamnese/AnamnesesTab";
import ImagensTab from "@/components/imagens/ImagensTab";
import { DocumentosTab } from "@/components/documentos/DocumentosTab";
import { EditPatientModal } from "@/components/pacientes/EditPatientModal";
import { FinanceiroTab } from "@/components/pacientes/FinanceiroTab";
import { OdontogramaTab } from "@/components/pacientes/OdontogramaTab";
import { AgendamentosTab } from "@/components/pacientes/AgendamentosTab";
import { cn, formatPhone } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  address?: string;
  nickname?: string;
  status?: string;
  civil_status?: string;
  education_level?: string;
}

type CadastroSection = "dados" | "contato" | "complementares";

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [activeTab, setActiveTab] = useState("cadastro");
  const [showNovoOrcamento, setShowNovoOrcamento] = useState(false);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [clinicaId, setClinicaId] = useState<string>("");
  const [activeSection, setActiveSection] = useState<CadastroSection>("dados");

  // Refs for scrolling
  const dadosRef = useRef<HTMLDivElement>(null);
  const contatoRef = useRef<HTMLDivElement>(null);
  const complementaresRef = useRef<HTMLDivElement>(null);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copiado!");
  };

  const scrollToSection = (section: CadastroSection) => {
    setActiveSection(section);
    const refs = {
      dados: dadosRef,
      contato: contatoRef,
      complementares: complementaresRef
    };
    refs[section]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getCivilStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      solteiro: "Solteiro(a)",
      casado: "Casado(a)",
      divorciado: "Divorciado(a)",
      viuvo: "Viúvo(a)",
      uniao_estavel: "União Estável"
    };
    return labels[status || ""] || "Não informado";
  };

  const getEducationLabel = (education?: string) => {
    const labels: Record<string, string> = {
      fundamental: "Ensino Fundamental",
      medio: "Ensino Médio",
      superior: "Ensino Superior",
      pos_graduacao: "Pós-graduação"
    };
    return labels[education || ""] || "Não informado";
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

  const isActive = patient.status !== "inactive";

  const tabItems = [
    { value: "cadastro", label: "Cadastro" },
    { value: "orcamentos", label: "Orçamentos" },
    { value: "financeiro", label: "Financeiro" },
    { value: "odontograma", label: "Odontograma" },
    { value: "tratamentos", label: "Tratamentos" },
    { value: "anamnese", label: "Anamnese" },
    { value: "imagens", label: "Imagens" },
    { value: "documentos", label: "Documentos" },
    { value: "agendamentos", label: "Agendamentos" },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 lg:space-y-6">
      {/* ==================== MOBILE HEADER ==================== */}
      {isMobile && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden -mx-4 sm:mx-0">
          {/* Top bar com gradiente */}
          <div className="bg-gradient-to-r from-[hsl(var(--flowdent-blue))] to-[hsl(var(--flow-turquoise))] px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard/prontuario")}
                className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-lg truncate">
                  {patient.full_name}
                </h1>
                <p className="text-white/80 text-sm">#{patientCode}</p>
              </div>
              <Badge className="bg-white/20 text-white border-0 shrink-0">
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
          
          {/* Avatar flutuante e ações rápidas */}
          <div className="px-4 py-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-14 w-14 border-4 border-card shadow-lg -mt-9 shrink-0">
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {patient.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 min-w-0 h-9"
                  onClick={() => setShowEditPatient(true)}
                >
                  <Edit className="h-4 w-4 mr-1.5 shrink-0" />
                  <span className="truncate">Editar</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 min-w-0 h-9"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-4 w-4 mr-1.5 shrink-0" />
                  <span className="truncate">WhatsApp</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline" className="h-9 w-9 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Link2 className="h-4 w-4 mr-2" />
                      Copiar Link
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Contato inline */}
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{formatPhone(patient.phone) || "Não informado"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{patient.email || "Não informado"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DESKTOP HEADER ==================== */}
      {!isMobile && (
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-start gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/prontuario")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Avatar className="h-20 w-20 shrink-0">
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {patient.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {patient.full_name.toUpperCase()}
                </h1>
                <span className="text-muted-foreground">({patientCode})</span>
                <Badge 
                  variant={isActive ? "default" : "secondary"}
                  className={cn(
                    isActive 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "bg-gray-400 text-white"
                  )}
                >
                  {isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-6 mt-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{formatPhone(patient.phone) || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{patient.email || "Não informado"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setShowEditPatient(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Send className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Action Cards - Desktop only */}
            <div className="hidden xl:flex gap-3 shrink-0">
              <Card className="w-40 cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="h-6 w-6 text-orange-500 mb-1" />
                  <span className="text-xs font-medium">Alerta de retorno</span>
                </CardContent>
              </Card>
              <Card className="w-40 cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                  <FileText className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs font-medium">Consultar CPF</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TABS ==================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Mobile: Horizontal scrollable tabs */}
        <TabsList className={cn(
          "w-full h-auto p-1 gap-1",
          isMobile 
            ? "flex justify-start overflow-x-auto scrollbar-hide flex-nowrap bg-muted/50 rounded-lg -mx-4 px-4 sm:mx-0 sm:px-1" 
            : "flex-wrap justify-start"
        )}>
          {tabItems.map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value}
              className={cn(
                isMobile && "flex-shrink-0 rounded-md px-3 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 lg:mt-6">
          {/* ==================== ABA CADASTRO ==================== */}
          <TabsContent value="cadastro" className="mt-0">
            {/* Mobile: Pills de subseção */}
            {isMobile && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
                {[
                  { key: "dados" as CadastroSection, label: "Dados" },
                  { key: "contato" as CadastroSection, label: "Contato" },
                  { key: "complementares" as CadastroSection, label: "Complementares" },
                ].map((section) => (
                  <button
                    key={section.key}
                    onClick={() => scrollToSection(section.key)}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                      activeSection === section.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Menu Lateral - Desktop only */}
              {!isMobile && (
                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="p-2">
                      <nav className="space-y-1">
                        <button
                          onClick={() => scrollToSection("dados")}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                            activeSection === "dados"
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <User className="h-4 w-4" />
                          Dados Cadastrais
                        </button>
                        <button
                          onClick={() => scrollToSection("contato")}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                            activeSection === "contato"
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <PhoneIcon className="h-4 w-4" />
                          Contato
                        </button>
                        <button
                          onClick={() => scrollToSection("complementares")}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                            activeSection === "complementares"
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          Dados Complementares
                        </button>
                      </nav>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Conteúdo Principal */}
              <div className={cn("space-y-4 lg:space-y-6", !isMobile && "lg:col-span-3")}>
                {/* Dados Cadastrais */}
                <Card ref={dadosRef}>
                  <CardContent className="pt-4 lg:pt-6">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                      <h3 className="font-semibold text-base lg:text-lg">Dados Cadastrais</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowEditPatient(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                    
                    {/* Mobile: Grid 2x2 compacto */}
                    {isMobile ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">Nome</span>
                          <span className="font-medium text-sm truncate block">{patient.full_name}</span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">Apelido</span>
                          <span className="font-medium text-sm">{patient.nickname || "-"}</span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">Nascimento</span>
                          <span className="font-medium text-sm">
                            {patient.birth_date 
                              ? new Date(patient.birth_date).toLocaleDateString("pt-BR")
                              : "-"}
                          </span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">Idade</span>
                          <span className="font-medium text-sm">
                            {patient.birth_date ? `${calculateAge(patient.birth_date)} anos` : "-"}
                          </span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">Sexo</span>
                          <span className="font-medium text-sm">
                            {patient.gender === "masculino" ? "Masculino" : 
                             patient.gender === "feminino" ? "Feminino" : "-"}
                          </span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">CPF</span>
                          <span className="font-medium text-sm">{patient.cpf || "-"}</span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">RG</span>
                          <span className="font-medium text-sm">{patient.rg || "-"}</span>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">Código</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm">{patientCode}</span>
                            <button
                              onClick={() => handleCopyCode(patientCode)}
                              className="p-1 hover:bg-muted rounded"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Desktop: Layout original */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Nome</span>
                          <span className="font-medium">{patient.full_name}</span>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Apelido</span>
                          <span className="font-medium">{patient.nickname || "Não informado"}</span>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Data de Nascimento</span>
                          <span className="font-medium">
                            {patient.birth_date 
                              ? new Date(patient.birth_date).toLocaleDateString("pt-BR")
                              : "Não informado"}
                          </span>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Idade</span>
                          <span className="font-medium">
                            {patient.birth_date ? `${calculateAge(patient.birth_date)} anos` : "Não informado"}
                          </span>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Sexo</span>
                          <span className="font-medium">
                            {patient.gender === "masculino" ? "Masculino" : 
                             patient.gender === "feminino" ? "Feminino" : "Não informado"}
                          </span>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">CPF</span>
                          <span className="font-medium">{patient.cpf || "Não informado"}</span>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">RG</span>
                          <span className="font-medium">{patient.rg || "Não informado"}</span>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Código do Paciente</span>
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
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contato */}
                <Card ref={contatoRef}>
                  <CardContent className="pt-4 lg:pt-6">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                      <h3 className="font-semibold text-base lg:text-lg">Contato</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowEditPatient(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                    
                    {isMobile ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">Celular</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm">{formatPhone(patient.phone)}</span>
                            <button onClick={handleWhatsApp} className="p-1 hover:bg-muted rounded text-green-600">
                              <MessageCircle className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">Email</span>
                          <span className="font-medium text-sm truncate block">{patient.email || "-"}</span>
                        </div>
                        <div className="col-span-2 bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">Endereço</span>
                          <span className="font-medium text-sm">{patient.address || "-"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Celular</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatPhone(patient.phone)}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleWhatsApp}>
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Email</span>
                          <span className="font-medium">{patient.email || "Não informado"}</span>
                        </div>

                        <div className="md:col-span-2">
                          <span className="text-sm text-muted-foreground block mb-1">Endereço</span>
                          <span className="font-medium">{patient.address || "Não informado"}</span>
                        </div>
                      </div>
                    )}

                    {patient.responsible_name && (
                      <>
                        <Separator className="my-4 lg:my-6" />
                        <h4 className="font-medium mb-3 lg:mb-4 text-sm lg:text-base">Dados do Responsável</h4>
                        
                        {isMobile ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 bg-muted/30 rounded-lg p-3">
                              <span className="text-xs text-muted-foreground block mb-0.5">Nome</span>
                              <span className="font-medium text-sm">{patient.responsible_name}</span>
                            </div>
                            {patient.responsible_cpf && (
                              <div className="bg-muted/30 rounded-lg p-3">
                                <span className="text-xs text-muted-foreground block mb-0.5">CPF</span>
                                <span className="font-medium text-sm">{patient.responsible_cpf}</span>
                              </div>
                            )}
                            {patient.responsible_birth_date && (
                              <div className="bg-muted/30 rounded-lg p-3">
                                <span className="text-xs text-muted-foreground block mb-0.5">Nascimento</span>
                                <span className="font-medium text-sm">
                                  {new Date(patient.responsible_birth_date).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            )}
                            {patient.responsible_phone && (
                              <div className="bg-muted/30 rounded-lg p-3">
                                <span className="text-xs text-muted-foreground block mb-0.5">Celular</span>
                                <span className="font-medium text-sm">{formatPhone(patient.responsible_phone)}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                              <span className="text-sm text-muted-foreground block mb-1">Nome do Responsável</span>
                              <span className="font-medium">{patient.responsible_name}</span>
                            </div>

                            {patient.responsible_cpf && (
                              <div>
                                <span className="text-sm text-muted-foreground block mb-1">CPF</span>
                                <span className="font-medium">{patient.responsible_cpf}</span>
                              </div>
                            )}

                            {patient.responsible_birth_date && (
                              <div>
                                <span className="text-sm text-muted-foreground block mb-1">Data de Nascimento</span>
                                <span className="font-medium">
                                  {new Date(patient.responsible_birth_date).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            )}

                            {patient.responsible_phone && (
                              <div>
                                <span className="text-sm text-muted-foreground block mb-1">Celular</span>
                                <span className="font-medium">{formatPhone(patient.responsible_phone)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Dados Complementares */}
                <Card ref={complementaresRef}>
                  <CardContent className="pt-4 lg:pt-6">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                      <h3 className="font-semibold text-base lg:text-lg">Dados Complementares</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowEditPatient(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                    
                    {isMobile ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/30 rounded-lg p-3">
                            <span className="text-xs text-muted-foreground block mb-0.5">Estado Civil</span>
                            <span className="font-medium text-sm">{getCivilStatusLabel(patient.civil_status)}</span>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <span className="text-xs text-muted-foreground block mb-0.5">Escolaridade</span>
                            <span className="font-medium text-sm truncate block">{getEducationLabel(patient.education_level)}</span>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <span className="text-xs text-muted-foreground block mb-0.5">Como conheceu</span>
                            <span className="font-medium text-sm capitalize">
                              {patient.how_found?.replace("_", " ") || "-"}
                            </span>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <span className="text-xs text-muted-foreground block mb-0.5">Cadastrado em</span>
                            <span className="font-medium text-sm">
                              {patient.created_at 
                                ? new Date(patient.created_at).toLocaleDateString("pt-BR")
                                : "-"}
                            </span>
                          </div>
                        </div>

                        {patient.tags && patient.tags.length > 0 && (
                          <div className="bg-muted/30 rounded-lg p-3">
                            <span className="text-xs text-muted-foreground block mb-2">Etiquetas</span>
                            <div className="flex flex-wrap gap-1.5">
                              {patient.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-muted/30 rounded-lg p-3">
                          <span className="text-xs text-muted-foreground block mb-0.5">Observações</span>
                          <span className="font-medium text-sm">{patient.notes || "Nenhuma observação"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Estado Civil</span>
                          <span className="font-medium">{getCivilStatusLabel(patient.civil_status)}</span>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Escolaridade</span>
                          <span className="font-medium">{getEducationLabel(patient.education_level)}</span>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Como conheceu a clínica</span>
                          <span className="font-medium capitalize">
                            {patient.how_found?.replace("_", " ") || "Não informado"}
                          </span>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">Cadastrado em</span>
                          <span className="font-medium">
                            {patient.created_at 
                              ? new Date(patient.created_at).toLocaleDateString("pt-BR")
                              : "Não informado"}
                          </span>
                        </div>

                        {patient.tags && patient.tags.length > 0 && (
                          <div className="md:col-span-2">
                            <span className="text-sm text-muted-foreground block mb-2">Etiquetas</span>
                            <div className="flex flex-wrap gap-2">
                              {patient.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <span className="text-sm text-muted-foreground block mb-1">Observações</span>
                          <span className="font-medium">{patient.notes || "Nenhuma observação"}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Outras Tabs */}
          <TabsContent value="orcamentos" className="mt-0">
            {loadingBudgets ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Carregando orçamentos...</p>
                </CardContent>
              </Card>
            ) : (
              <OrcamentosTab 
                budgets={budgets}
                onRefresh={loadBudgets}
                onNewBudget={() => setShowNovoOrcamento(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="tratamentos" className="mt-0">
            <TratamentosTab patientId={id!} />
          </TabsContent>

          <TabsContent value="anamnese" className="mt-0">
            <AnamnesesTab patientId={id!} />
          </TabsContent>

          <TabsContent value="imagens" className="mt-0">
            <ImagensTab patientId={id!} />
          </TabsContent>

          <TabsContent value="documentos" className="mt-0">
            <DocumentosTab patientId={id!} />
          </TabsContent>

          <TabsContent value="financeiro" className="mt-0">
            <FinanceiroTab patientId={id!} clinicId={clinicaId} />
          </TabsContent>

          <TabsContent value="odontograma" className="mt-0">
            <OdontogramaTab 
              patientId={id!} 
              onAddProcedimento={() => setShowNovoOrcamento(true)}
            />
          </TabsContent>

          <TabsContent value="agendamentos" className="mt-0">
            <AgendamentosTab patientId={id!} />
          </TabsContent>
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

      {patient && (
        <EditPatientModal
          open={showEditPatient}
          onOpenChange={setShowEditPatient}
          patient={patient}
          onSuccess={loadPatient}
        />
      )}
    </div>
  );
};

export default PatientDetails;
