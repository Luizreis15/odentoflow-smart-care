import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, Plus, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const appointmentSchema = z.object({
  patientId: z.string().uuid("Selecione um paciente válido"),
  dentistId: z.string().uuid("Selecione um dentista válido"),
  title: z.string().min(1, "Tipo de consulta é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  duration: z.string().min(1, "Duração é obrigatória"),
});

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    dentistId: "all",
    dateRange: "today" as "today" | "week" | "month" | "custom"
  });
  const [formData, setFormData] = useState({
    patientId: "",
    dentistId: "",
    title: "",
    date: "",
    time: "",
    duration: "30",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filters, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load patients
      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select("id, full_name")
        .order("full_name");
      
      if (patientsError) throw patientsError;
      setPatients(patientsData || []);

      // Load dentists from user's clinic
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (!profile?.clinic_id) throw new Error("Clínica não encontrada");

      const { data: dentistsData, error: dentistsError } = await supabase
        .from("profissionais")
        .select("id, nome, cro, especialidade")
        .eq("clinica_id", profile.clinic_id)
        .eq("ativo", true)
        .order("nome");
      
      if (dentistsError) {
        console.error("Erro ao carregar dentistas:", dentistsError);
        throw dentistsError;
      }
      
      console.log("Dentistas carregados:", dentistsData);
      setDentists(dentistsData || []);

      // Show info if no data
      if (!patientsData?.length) {
        toast.info("Cadastre pacientes no Prontuário antes de criar agendamentos");
      }
      if (!dentistsData?.length) {
        toast.info("Cadastre profissionais no CRM antes de criar agendamentos");
      }

      // Load appointments
      await loadAppointments();
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          title,
          description,
          appointment_date,
          duration_minutes,
          status,
          patient:patients(id, full_name),
          dentist:profissionais(id, nome)
        `)
        .order("appointment_date");
      
      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos: " + error.message);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Filtro por status
    if (filters.status !== "all") {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    // Filtro por dentista
    if (filters.dentistId !== "all") {
      filtered = filtered.filter(apt => apt.dentist_id === filters.dentistId);
    }

    // Filtro por data
    if (filters.dateRange === "today") {
      filtered = filtered.filter(apt => {
        const aptDate = parseISO(apt.appointment_date);
        return isSameDay(aptDate, selectedDate);
      });
    } else if (filters.dateRange === "week") {
      const weekStart = startOfWeek(selectedDate, { locale: ptBR });
      const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
      filtered = filtered.filter(apt => {
        const aptDate = parseISO(apt.appointment_date);
        return aptDate >= weekStart && aptDate <= weekEnd;
      });
    }

    setFilteredAppointments(filtered);
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      dentistId: "all",
      dateRange: "today"
    });
  };

  const statusColors = {
    confirmed: "bg-secondary text-secondary-foreground",
    scheduled: "bg-primary/10 text-primary",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const statusLabels = {
    confirmed: "Confirmado",
    scheduled: "Agendado",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validatedData = appointmentSchema.parse({
        patientId: formData.patientId,
        dentistId: formData.dentistId,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
      });

      setSaving(true);

      // Combine date and time into timestamp
      const appointmentDateTime = new Date(`${validatedData.date}T${validatedData.time}`);

      // Save to database
      const { error } = await supabase
        .from("appointments")
        .insert({
          patient_id: validatedData.patientId,
          dentist_id: validatedData.dentistId,
          title: validatedData.title,
          appointment_date: appointmentDateTime.toISOString(),
          duration_minutes: parseInt(validatedData.duration),
          status: "scheduled",
        });

      if (error) throw error;

      toast.success("Agendamento criado com sucesso!");
      setIsSheetOpen(false);
      setFormData({
        patientId: "",
        dentistId: "",
        title: "",
        date: "",
        time: "",
        duration: "30",
      });

      // Reload appointments
      await loadAppointments();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Erro ao criar agendamento:", error);
        toast.error("Erro ao criar agendamento: " + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(selectedDate, { locale: ptBR });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const getAppointmentsByDentist = () => {
    const grouped: Record<string, any[]> = {};
    filteredAppointments.forEach(apt => {
      const dentistId = apt.dentist?.id || "sem-dentista";
      const dentistName = apt.dentist?.nome || "Sem Dentista";
      if (!grouped[dentistId]) {
        grouped[dentistId] = [];
      }
      grouped[dentistId].push({ ...apt, dentistName });
    });
    return grouped;
  };

  const todayAppointments = filteredAppointments.filter(apt => 
    isSameDay(parseISO(apt.appointment_date), new Date())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda Inteligente</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie agendamentos, horários e profissionais
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
                {(filters.status !== "all" || filters.dentistId !== "all") && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {[filters.status !== "all", filters.dentistId !== "all"].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Filtre os agendamentos por status, profissional e período
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Profissional</Label>
                  <Select value={filters.dentistId} onValueChange={(value) => setFilters({ ...filters, dentistId: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {dentists.map(dentist => (
                        <SelectItem key={dentist.id} value={dentist.id}>
                          {dentist.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={filters.dateRange} onValueChange={(value: any) => setFilters({ ...filters, dateRange: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Esta Semana</SelectItem>
                      <SelectItem value="month">Este Mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                  <Button className="flex-1" onClick={() => setIsFilterOpen(false)}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[500px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Novo Agendamento</SheetTitle>
                <SheetDescription>
                  Preencha os dados para criar um novo agendamento
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dentist">Dentista *</Label>
                  <Select value={formData.dentistId} onValueChange={(value) => setFormData({ ...formData, dentistId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dentista" />
                    </SelectTrigger>
                    <SelectContent>
                      {dentists.map((dentist) => (
                        <SelectItem key={dentist.id} value={dentist.id}>
                          {dentist.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Consulta *</Label>
                  <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Limpeza">Limpeza</SelectItem>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="Canal">Canal</SelectItem>
                      <SelectItem value="Clareamento">Clareamento</SelectItem>
                      <SelectItem value="Ortodontia">Ortodontia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                      <SelectItem value="120">120 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsSheetOpen(false)} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? "Salvando..." : "Criar Agendamento"}
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayAppointments.filter(a => a.status === "confirmed").length} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredAppointments.filter(a => a.status === "completed").length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profissionais Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dentists.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Set(filteredAppointments.map(a => a.dentist_id)).size} com agendamentos
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="day" className="space-y-4">
        <TabsList>
          <TabsTrigger value="day">Dia</TabsTrigger>
          <TabsTrigger value="week">Semana</TabsTrigger>
          <TabsTrigger value="dentist">Por Dentista</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agendamentos do Dia</CardTitle>
                  <CardDescription>
                    {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </CardDescription>
                </div>
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando agendamentos...
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado para este dia
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments
                    .filter(apt => isSameDay(parseISO(apt.appointment_date), selectedDate))
                    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                    .map((apt) => {
                      const aptDate = parseISO(apt.appointment_date);
                      const aptTime = format(aptDate, "HH:mm");
                      
                      return (
                        <div
                          key={apt.id}
                          className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                            <Clock className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-lg">{aptTime}</span>
                              <Badge className={statusColors[apt.status as keyof typeof statusColors]}>
                                {statusLabels[apt.status as keyof typeof statusLabels]}
                              </Badge>
                            </div>
                            <p className="font-medium text-foreground">{apt.patient?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.title} • {apt.dentist?.nome} • {apt.duration_minutes} min
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <Card>
            <CardHeader>
              <CardTitle>Visão Semanal</CardTitle>
              <CardDescription>
                {format(startOfWeek(selectedDate, { locale: ptBR }), "dd 'de' MMM", { locale: ptBR })} - {format(endOfWeek(selectedDate, { locale: ptBR }), "dd 'de' MMM", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando agendamentos...
                </div>
              ) : (
                <div className="space-y-4">
                  {getWeekDays().map((day) => {
                    const dayAppointments = filteredAppointments
                      .filter(apt => isSameDay(parseISO(apt.appointment_date), day))
                      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

                    return (
                      <div key={day.toISOString()} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {format(day, "EEEE", { locale: ptBR })}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(day, "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                          </div>
                          <Badge variant={dayAppointments.length > 0 ? "default" : "secondary"}>
                            {dayAppointments.length} agendamento{dayAppointments.length !== 1 && "s"}
                          </Badge>
                        </div>
                        
                        {dayAppointments.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum agendamento
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {dayAppointments.map(apt => {
                              const aptTime = format(parseISO(apt.appointment_date), "HH:mm");
                              return (
                                <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">{aptTime} - {apt.patient?.full_name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {apt.title} • {apt.dentist?.nome}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={statusColors[apt.status as keyof typeof statusColors]}>
                                    {statusLabels[apt.status as keyof typeof statusLabels]}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dentist">
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando agendamentos...
                  </div>
                </CardContent>
              </Card>
            ) : dentists.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum profissional cadastrado
                  </div>
                </CardContent>
              </Card>
            ) : (
              Object.entries(getAppointmentsByDentist()).map(([dentistId, dentistAppointments]) => {
                const dentist = dentists.find(d => d.id === dentistId);
                const dentistName = dentist?.nome || "Sem Dentista Atribuído";
                
                return (
                  <Card key={dentistId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{dentistName}</CardTitle>
                          <CardDescription>
                            {dentist?.especialidade && `${dentist.especialidade} • `}
                            {dentist?.cro}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {dentistAppointments.length} agendamento{dentistAppointments.length !== 1 && "s"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {dentistAppointments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum agendamento
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {dentistAppointments
                            .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                            .map(apt => {
                              const aptDate = parseISO(apt.appointment_date);
                              const aptTime = format(aptDate, "HH:mm");
                              const aptDay = format(aptDate, "dd/MM/yyyy");
                              
                              return (
                                <div
                                  key={apt.id}
                                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                                    <Clock className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-lg">{aptDay} às {aptTime}</span>
                                      <Badge className={statusColors[apt.status as keyof typeof statusColors]}>
                                        {statusLabels[apt.status as keyof typeof statusLabels]}
                                      </Badge>
                                    </div>
                                    <p className="font-medium text-foreground">{apt.patient?.full_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {apt.title} • {apt.duration_minutes} min
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Ver Detalhes
                                  </Button>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Agenda;