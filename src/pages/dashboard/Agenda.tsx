import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, Plus, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const appointmentSchema = z.object({
  patientId: z.string().uuid("Selecione um paciente válido"),
  dentistId: z.string().uuid("Selecione um dentista válido"),
  title: z.string().min(1, "Tipo de consulta é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  duration: z.string().min(1, "Duração é obrigatória"),
});

const Agenda = () => {
  const [selectedDate] = useState(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
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

      // Load dentists
      const { data: dentistsData, error: dentistsError } = await supabase
        .from("professionals")
        .select("id, full_name")
        .order("full_name");
      
      if (dentistsError) throw dentistsError;
      setDentists(dentistsData || []);

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
          dentist:professionals(id, full_name)
        `)
        .order("appointment_date");
      
      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos: " + error.message);
    }
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
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
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
                          {dentist.full_name}
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
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">4 confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Presença
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground mt-1">+2% vs. semana passada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próxima Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14:30</div>
            <p className="text-xs text-muted-foreground mt-1">Pedro Oliveira - Canal</p>
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
                  <CardTitle>Agendamentos de Hoje</CardTitle>
                  <CardDescription>
                    {selectedDate.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => {
                    const aptDate = new Date(apt.appointment_date);
                    const aptTime = aptDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                    
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
                            {apt.title} • {apt.dentist?.full_name} • {apt.duration_minutes} min
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
              <CardDescription>Agendamentos da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Visualização de agenda semanal em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dentist">
          <Card>
            <CardHeader>
              <CardTitle>Agenda por Profissional</CardTitle>
              <CardDescription>Visualize agendamentos por dentista</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Visualização por profissional em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Agenda;