import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, parseISO, isToday } from "date-fns";
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    dentistId: "all",
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

  const getFilteredAppointments = () => {
    let filtered = [...appointments];

    // Filtro por status
    if (filters.status !== "all") {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    // Filtro por dentista
    if (filters.dentistId !== "all") {
      filtered = filtered.filter(apt => apt.dentist_id === filters.dentistId);
    }

    return filtered;
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      dentistId: "all",
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return getFilteredAppointments().filter(apt => 
      isSameDay(parseISO(apt.appointment_date), date)
    );
  };

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const todayAppointments = getAppointmentsForDate(new Date());
  const weekStart = startOfWeek(new Date(), { locale: ptBR });
  const weekEnd = endOfWeek(new Date(), { locale: ptBR });
  const weekAppointments = getFilteredAppointments().filter(apt => {
    const aptDate = parseISO(apt.appointment_date);
    return aptDate >= weekStart && aptDate <= weekEnd;
  });

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

  const selectedDayAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda Inteligente</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie agendamentos e horários com calendário visual
          </p>
        </div>
        <div className="flex gap-2">
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
                  Filtre os agendamentos por status e profissional
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
            <div className="text-3xl font-bold">{weekAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {weekAppointments.filter(a => a.status === "completed").length} concluídas
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
              disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Calendário Visual */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl capitalize">
                  {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </CardTitle>
                <CardDescription>Clique em um dia para ver os agendamentos</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}>
                  Hoje
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando calendário...
              </div>
            ) : (
              <div className="space-y-2">
                {/* Cabeçalho dos dias da semana */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grid de dias do mês */}
                <div className="grid grid-cols-7 gap-2">
                  {getCalendarDays().map((day, idx) => {
                    const dayAppointments = getAppointmentsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "relative min-h-[80px] p-2 rounded-lg border-2 transition-all",
                          "flex flex-col items-start justify-start",
                          "hover:border-primary hover:shadow-md",
                          isCurrentMonth ? "bg-card" : "bg-muted/30",
                          isSelected && "border-primary bg-primary/5 shadow-md",
                          !isSelected && "border-border",
                          isTodayDate && "ring-2 ring-primary/20"
                        )}
                      >
                        <span className={cn(
                          "text-sm font-medium mb-1",
                          !isCurrentMonth && "text-muted-foreground",
                          isSelected && "text-primary font-bold",
                          isTodayDate && !isSelected && "text-primary"
                        )}>
                          {format(day, "d")}
                        </span>
                        
                        {dayAppointments.length > 0 && (
                          <div className="space-y-1 w-full">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <div
                                key={apt.id}
                                className={cn(
                                  "text-xs px-1.5 py-0.5 rounded truncate",
                                  apt.status === "confirmed" && "bg-secondary/80 text-secondary-foreground",
                                  apt.status === "scheduled" && "bg-primary/20 text-primary",
                                  apt.status === "completed" && "bg-muted text-muted-foreground",
                                  apt.status === "cancelled" && "bg-destructive/20 text-destructive"
                                )}
                              >
                                {format(parseISO(apt.appointment_date), "HH:mm")} {apt.patient?.full_name?.split(' ')[0]}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-muted-foreground px-1.5">
                                +{dayAppointments.length - 2} mais
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Painel lateral com detalhes do dia selecionado */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl capitalize">
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </CardTitle>
                  <CardDescription className="capitalize">
                    {format(selectedDate, "EEEE", { locale: ptBR })}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {selectedDayAppointments.length} consulta{selectedDayAppointments.length !== 1 && "s"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {selectedDayAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum agendamento neste dia</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {selectedDayAppointments
                    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                    .map((apt) => {
                      const aptTime = format(parseISO(apt.appointment_date), "HH:mm");
                      
                      return (
                        <div
                          key={apt.id}
                          className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{aptTime}</span>
                            </div>
                            <Badge className={statusColors[apt.status as keyof typeof statusColors]}>
                              {statusLabels[apt.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{apt.patient?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.title} • {apt.dentist?.nome}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Duração: {apt.duration_minutes} min
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            Ver Detalhes
                          </Button>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
