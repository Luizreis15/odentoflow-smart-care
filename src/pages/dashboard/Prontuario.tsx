import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Upload } from "lucide-react";
import { ImportPacientesModal } from "@/components/pacientes/ImportPacientesModal";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const patientSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  gender: z.enum(["masculino", "feminino"], { required_error: "Selecione o sexo" }),
  is_foreign: z.boolean().optional(),
  birth_date: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  how_found: z.string().optional(),
  tags: z.string().optional(),
  responsible_name: z.string().optional(),
  responsible_birth_date: z.string().optional(),
  responsible_cpf: z.string().optional(),
  responsible_phone: z.string().optional(),
  notes: z.string().optional(),
});

const Prontuario = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "" as "masculino" | "feminino" | "",
    is_foreign: false,
    birth_date: "",
    cpf: "",
    rg: "",
    phone: "",
    how_found: "",
    tags: "",
    responsible_name: "",
    responsible_birth_date: "",
    responsible_cpf: "",
    responsible_phone: "",
    notes: "",
  });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter((patient) =>
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.cpf?.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("full_name");
      
      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar pacientes:", error);
      toast.error("Erro ao carregar pacientes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validatedData = patientSchema.parse({
        full_name: formData.full_name,
        gender: formData.gender || undefined,
        is_foreign: formData.is_foreign,
        birth_date: formData.birth_date || undefined,
        cpf: formData.cpf || undefined,
        rg: formData.rg || undefined,
        phone: formData.phone,
        how_found: formData.how_found || undefined,
        tags: formData.tags || undefined,
        responsible_name: formData.responsible_name || undefined,
        responsible_birth_date: formData.responsible_birth_date || undefined,
        responsible_cpf: formData.responsible_cpf || undefined,
        responsible_phone: formData.responsible_phone || undefined,
        notes: formData.notes || undefined,
      });

      setSaving(true);

      // Get user's clinic_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (!profile?.clinic_id) throw new Error("Clínica não encontrada");

      // Parse tags if provided
      const tagsArray = validatedData.tags 
        ? validatedData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : null;

      // Save to database
      const { error } = await supabase
        .from("patients")
        .insert({
          clinic_id: profile.clinic_id,
          full_name: validatedData.full_name,
          gender: validatedData.gender || null,
          is_foreign: validatedData.is_foreign || false,
          birth_date: validatedData.birth_date || null,
          cpf: validatedData.cpf || null,
          rg: validatedData.rg || null,
          phone: validatedData.phone,
          how_found: validatedData.how_found || null,
          tags: tagsArray,
          responsible_name: validatedData.responsible_name || null,
          responsible_birth_date: validatedData.responsible_birth_date || null,
          responsible_cpf: validatedData.responsible_cpf || null,
          responsible_phone: validatedData.responsible_phone || null,
          notes: validatedData.notes || null,
        });

      if (error) throw error;

      toast.success("Paciente cadastrado com sucesso!");
      setIsSheetOpen(false);
      setFormData({
        full_name: "",
        gender: "",
        is_foreign: false,
        birth_date: "",
        cpf: "",
        rg: "",
        phone: "",
        how_found: "",
        tags: "",
        responsible_name: "",
        responsible_birth_date: "",
        responsible_cpf: "",
        responsible_phone: "",
        notes: "",
      });

      // Reload patients
      await loadPatients();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Erro ao cadastrar paciente:", error);
        toast.error("Erro ao cadastrar paciente: " + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const recentRecords = [
    {
      id: 1,
      patient: "Maria Silva",
      date: "2024-03-15",
      type: "Consulta",
      dentist: "Dr. João Santos",
      notes: "Limpeza completa realizada. Sem problemas dentários.",
    },
    {
      id: 2,
      patient: "Carlos Mendes",
      date: "2024-03-10",
      type: "Canal",
      dentist: "Dra. Ana Paula",
      notes: "Início de tratamento de canal no dente 16.",
    },
  ];

  const statusColors = {
    ativo: "bg-secondary text-secondary-foreground",
    tratamento: "bg-primary/10 text-primary",
    inativo: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prontuário Digital</h1>
          <p className="text-muted-foreground mt-1">
            Histórico clínico completo dos pacientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar Pacientes
          </Button>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
            </SheetTrigger>
          <SheetContent className="sm:max-w-[700px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Dados do paciente</SheetTitle>
              <SheetDescription>
                Preencha os dados do paciente para criar o prontuário
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Dados do Paciente */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Dados do paciente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="full_name">Nome do paciente *</Label>
                    <Input
                      id="full_name"
                      placeholder="Nome completo do paciente"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sexo *</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value: "masculino" | "feminino") => 
                        setFormData({ ...formData, gender: value })
                      }
                      className="flex gap-4"
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="masculino" id="masculino" />
                        <Label htmlFor="masculino" className="font-normal cursor-pointer">
                          Masculino
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="feminino" id="feminino" />
                        <Label htmlFor="feminino" className="font-normal cursor-pointer">
                          Feminino
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_foreign"
                    checked={formData.is_foreign}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_foreign: checked })
                    }
                  />
                  <Label htmlFor="is_foreign" className="font-normal cursor-pointer">
                    Paciente estrangeiro
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      placeholder="00.000.000-0"
                      value={formData.rg}
                      onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Celular do paciente *</Label>
                  <div className="flex gap-2">
                    <Input
                      className="w-24"
                      value="+55"
                      disabled
                    />
                    <Input
                      id="phone"
                      placeholder="11 93736 7647"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="how_found">Como o paciente chegou na clínica</Label>
                  <Select
                    value={formData.how_found}
                    onValueChange={(value) => setFormData({ ...formData, how_found: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
                      <SelectItem value="placa">Placa/Fachada</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Etiquetas</Label>
                  <Input
                    id="tags"
                    placeholder="Digite etiquetas separadas por vírgula"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe as etiquetas com vírgula (ex: VIP, Ortodontia, Prioritário)
                  </p>
                </div>
              </div>

              {/* Dados do Responsável */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-foreground">Dados do responsável</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsible_name">Nome do responsável</Label>
                    <Input
                      id="responsible_name"
                      placeholder="Nome completo do responsável"
                      value={formData.responsible_name}
                      onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsible_birth_date">Data de nascimento</Label>
                    <Input
                      id="responsible_birth_date"
                      type="date"
                      value={formData.responsible_birth_date}
                      onChange={(e) => setFormData({ ...formData, responsible_birth_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsible_cpf">CPF</Label>
                    <Input
                      id="responsible_cpf"
                      placeholder="000.000.000-00"
                      value={formData.responsible_cpf}
                      onChange={(e) => setFormData({ ...formData, responsible_cpf: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsible_phone">Celular do responsável</Label>
                    <Input
                      id="responsible_phone"
                      placeholder="(00) 00000-0000"
                      value={formData.responsible_phone}
                      onChange={(e) => setFormData({ ...formData, responsible_phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Observação */}
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="notes">Observação</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o paciente"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsSheetOpen(false)} 
                  disabled={saving}
                >
                  FECHAR
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "SALVANDO..." : "SALVAR"}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
        </div>
      </div>

      <ImportPacientesModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onSuccess={loadPatients}
      />

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">248</div>
            <p className="text-xs text-muted-foreground mt-1">+18 este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Tratamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">32</div>
            <p className="text-xs text-muted-foreground mt-1">12.9% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prontuários Atualizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">198</div>
            <p className="text-xs text-muted-foreground mt-1">79.8% completos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anexos Salvos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.2k</div>
            <p className="text-xs text-muted-foreground mt-1">Imagens e docs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Paciente</CardTitle>
          <CardDescription>Encontre prontuários por nome, CPF ou telefone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome do paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="treatment">Em Tratamento</TabsTrigger>
          <TabsTrigger value="inactive">Inativos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pacientes</CardTitle>
              <CardDescription>Lista completa de prontuários</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando pacientes...
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold">
                        {patient.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">{patient.full_name}</p>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{patient.phone}</span>
                          {patient.email && (
                            <>
                              <span>•</span>
                              <span>{patient.email}</span>
                            </>
                          )}
                          {patient.birth_date && (
                            <>
                              <span>•</span>
                              <span>{new Date(patient.birth_date).toLocaleDateString("pt-BR")}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/prontuario/${patient.id}`)}
                      >
                        Ver Prontuário
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">Filtro de pacientes ativos</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment">
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">Filtro de pacientes em tratamento</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">Filtro de pacientes inativos</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Atendimentos</CardTitle>
          <CardDescription>Prontuários recentemente atualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="flex gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/20">
                  <FileText className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{record.patient}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {record.type} • {record.dentist}
                  </p>
                  <p className="text-sm mt-2">{record.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prontuario;