import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Filter, X, UserPlus, ArrowLeft, Users, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, parseISO, isToday, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CadastroRapidoPacienteModal } from "@/components/agenda/CadastroRapidoPacienteModal";

const appointmentSchema = z.object({
  patientId: z.string().uuid("Selecione um paciente válido"),
  dentistId: z.string().uuid("Selecione um dentista válido"),
  title: z.string().min(1, "Tipo de consulta é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  duration: z.string().min(1, "Duração é obrigatória"),
});

// Generate time slots from 08:00 to 18:00 in 30min intervals
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Helper to check if a date is in the past
const isPastDate = (date: Date) => {
  return isBefore(startOfDay(date), startOfDay(new Date()));
};

// Helper to check if a specific time slot has passed
const isPastSlot = (date: Date, time: string) => {
  if (isPastDate(date)) return true;
  
  // If it's today, check if the time has passed
  if (isSameDay(date, new Date())) {
    const now = new Date();
    const [hour, minute] = time.split(":").map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);
    return slotTime < now;
  }
  
  return false;
};

const Agenda = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "day-slots">("calendar");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [openPatientCombobox, setOpenPatientCombobox] = useState(false);
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

  // Handle URL params for pre-selecting date/time
  useEffect(() => {
    const dateParam = searchParams.get("date");
    const timeParam = searchParams.get("time");
    
    if (dateParam) {
      const parsedDate = parseISO(dateParam);
      setSelectedDate(parsedDate);
      setCurrentMonth(parsedDate);
      setViewMode("day-slots");
      
      if (timeParam) {
        // Only open form if slot is not in the past
        if (!isPastSlot(parsedDate, timeParam)) {
          setFormData(prev => ({
            ...prev,
            date: dateParam,
            time: timeParam,
          }));
          setIsSheetOpen(true);
        } else {
          toast.info("Este horário já passou. Selecione outro horário disponível.");
        }
      }
      
      // Clear params after processing
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

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

  // Handle slot click - pre-fill form and open sheet
  const handleSlotClick = (date: Date, time: string) => {
    // Block scheduling in past dates/times
    if (isPastSlot(date, time)) {
      toast.error("Não é possível agendar em horários passados");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      date: format(date, "yyyy-MM-dd"),
      time: time,
    }));
    setIsSheetOpen(true);
  };

  // Handle day click from calendar - switch to slots view
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setViewMode("day-slots");
  };

  // Get appointment for a specific time slot
  const getAppointmentForSlot = (time: string) => {
    const dayAppointments = getAppointmentsForDate(selectedDate);
    return dayAppointments.find(apt => {
      const aptTime = format(parseISO(apt.appointment_date), "HH:mm");
      return aptTime === time;
    });
  };

  // Check if slot is within an appointment duration
  const isSlotOccupied = (time: string) => {
    const dayAppointments = getAppointmentsForDate(selectedDate);
    const [slotHour, slotMinute] = time.split(":").map(Number);
    const slotMinutes = slotHour * 60 + slotMinute;
    
    return dayAppointments.some(apt => {
      const aptDate = parseISO(apt.appointment_date);
      const aptStartMinutes = aptDate.getHours() * 60 + aptDate.getMinutes();
      const aptEndMinutes = aptStartMinutes + (apt.duration_minutes || 30);
      return slotMinutes >= aptStartMinutes && slotMinutes < aptEndMinutes;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date/time before proceeding
    const appointmentDate = parseISO(formData.date);
    if (isPastSlot(appointmentDate, formData.time)) {
      toast.error("Não é possível criar agendamentos em datas/horários passados");
      return;
    }
    
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

  const handlePatientCreated = async (patientId: string) => {
    // Recarregar lista de pacientes
    await loadData();
    // Selecionar automaticamente o novo paciente
    setFormData({ ...formData, patientId });
  };

  // Day Slots View Component
  const DayTimeSlotsView = () => {
    const availableSlots = TIME_SLOTS.filter(time => !isSlotOccupied(time)).length;
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setViewMode("calendar")}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl capitalize">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </CardTitle>
                <CardDescription className="capitalize">
                  {format(selectedDate, "EEEE", { locale: ptBR })} • {availableSlots} horários disponíveis
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {selectedDayAppointments.length} agendamento{selectedDayAppointments.length !== 1 && "s"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {TIME_SLOTS.map((time) => {
              const appointment = getAppointmentForSlot(time);
              const occupied = isSlotOccupied(time);
              const slotPassed = isPastSlot(selectedDate, time);
              
              if (appointment) {
                // Slot with appointment
                return (
                  <div
                    key={time}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-l-4 transition-all",
                      "bg-[hsl(var(--card-blue))] border-l-[hsl(var(--flowdent-blue))]"
                    )}
                  >
                    <div className="flex items-center justify-center w-16 shrink-0">
                      <span className="text-lg font-bold text-[hsl(var(--flowdent-blue))]">{time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground truncate">
                          {appointment.patient?.full_name}
                        </p>
                        <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                          {statusLabels[appointment.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {appointment.title} • {appointment.dentist?.nome} • {appointment.duration_minutes} min
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                );
              }
              
              if (occupied) {
                // Slot is within another appointment's duration - show as disabled
                return (
                  <div
                    key={time}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 opacity-50"
                  >
                    <div className="flex items-center justify-center w-16 shrink-0">
                      <span className="text-sm font-medium text-muted-foreground">{time}</span>
                    </div>
                    <span className="text-sm text-muted-foreground italic">Em consulta</span>
                  </div>
                );
              }
              
              // Past slot - show as unavailable
              if (slotPassed) {
                return (
                  <div
                    key={time}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/40 border-l-4 border-muted-foreground/20"
                  >
                    <div className="flex items-center justify-center w-16 shrink-0">
                      <span className="text-sm font-medium text-muted-foreground/60">{time}</span>
                    </div>
                    <span className="text-sm text-muted-foreground/60 italic">Horário passado</span>
                  </div>
                );
              }
              
              // Available slot - clickable
              return (
                <button
                  key={time}
                  onClick={() => handleSlotClick(selectedDate, time)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-lg border-l-4 transition-all",
                    "bg-[hsl(var(--card-green))] border-l-[hsl(var(--success-green))]",
                    "hover:shadow-md hover:scale-[1.01] cursor-pointer",
                    "group"
                  )}
                >
                  <div className="flex items-center justify-center w-16 shrink-0">
                    <span className="text-lg font-bold text-[hsl(var(--success-green))]">{time}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[hsl(var(--success-green))] group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-[hsl(var(--success-green))]">
                      Horário Disponível
                    </span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      — Clique para agendar
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Compacto com Filtro de Profissional Visível */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Filtro por Profissional - Sempre Visível */}
          <Select 
            value={filters.dentistId} 
            onValueChange={(value) => setFilters({ ...filters, dentistId: value })}
          >
            <SelectTrigger className="w-[220px]">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Todos Profissionais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Profissionais</SelectItem>
              {dentists.map(dentist => (
                <SelectItem key={dentist.id} value={dentist.id}>
                  {dentist.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Mais Filtros
                {filters.status !== "all" && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    1
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
                  {formData.date && formData.time 
                    ? `Agendando para ${format(parseISO(formData.date), "dd/MM/yyyy", { locale: ptBR })} às ${formData.time}`
                    : "Preencha os dados para criar um novo agendamento"
                  }
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="patient">Paciente *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsNewPatientModalOpen(true)}
                      className="h-7 text-xs"
                    >
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                      Novo Paciente
                    </Button>
                  </div>
                  <Popover open={openPatientCombobox} onOpenChange={setOpenPatientCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPatientCombobox}
                        className="w-full justify-between font-normal"
                      >
                        {formData.patientId
                          ? patients.find((p) => p.id === formData.patientId)?.full_name
                          : "Pesquisar paciente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Digite o nome do paciente..." />
                        <CommandList>
                          <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                          <CommandGroup>
                            {patients.map((patient) => (
                              <CommandItem
                                key={patient.id}
                                value={patient.full_name}
                                onSelect={() => {
                                  setFormData({ ...formData, patientId: patient.id });
                                  setOpenPatientCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.patientId === patient.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {patient.full_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                      className={formData.date ? "border-[hsl(var(--success-green))] bg-[hsl(var(--card-green))]" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className={formData.time ? "border-[hsl(var(--success-green))] bg-[hsl(var(--card-green))]" : ""}
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

      {/* Conditional rendering based on view mode */}
      {viewMode === "day-slots" ? (
        <DayTimeSlotsView />
      ) : (
        <div className="grid lg:grid-cols-[1fr_350px] gap-4">
          {/* Calendário Visual */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl capitalize">
                    {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                  </CardTitle>
                  <CardDescription>Clique em um dia para ver os horários</CardDescription>
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
                      // Calculate available slots for this day
                      const occupiedCount = dayAppointments.length;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleDayClick(day)}
                          className={cn(
                            "relative min-h-[80px] p-2 rounded-lg border-2 transition-all",
                            "flex flex-col items-start justify-start",
                            "hover:border-primary hover:shadow-md hover:scale-[1.02]",
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
                          
                          {/* Badge showing slots info */}
                          {isCurrentMonth && occupiedCount === 0 && (
                            <div className="absolute bottom-1 right-1">
                              <Badge variant="outline" className="text-[10px] px-1 py-0 bg-[hsl(var(--card-green))] text-[hsl(var(--success-green))] border-[hsl(var(--success-green))]/30">
                                Livre
                              </Badge>
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
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedDayAppointments.length} consulta{selectedDayAppointments.length !== 1 && "s"}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => setViewMode("day-slots")}
                      className="bg-[hsl(var(--success-green))] hover:bg-[hsl(var(--success-green))]/90"
                    >
                      Ver Horários
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedDayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-[hsl(var(--success-green))]/50" />
                    <p className="text-muted-foreground mb-4">Nenhum agendamento neste dia</p>
                    <Button 
                      onClick={() => setViewMode("day-slots")}
                      className="bg-[hsl(var(--success-green))] hover:bg-[hsl(var(--success-green))]/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agendar Consulta
                    </Button>
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
                    
                    {/* Button to see all slots */}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-[hsl(var(--success-green))] text-[hsl(var(--success-green))] hover:bg-[hsl(var(--card-green))]"
                      onClick={() => setViewMode("day-slots")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ver Todos os Horários
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <CadastroRapidoPacienteModal
        open={isNewPatientModalOpen}
        onOpenChange={setIsNewPatientModalOpen}
        onPatientCreated={handlePatientCreated}
      />
    </div>
  );
};

export default Agenda;
