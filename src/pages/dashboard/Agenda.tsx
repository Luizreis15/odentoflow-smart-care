import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, Plus, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Agenda = () => {
  const [selectedDate] = useState(new Date());

  const appointments = [
    {
      id: 1,
      time: "09:00",
      patient: "Maria Silva",
      dentist: "Dr. João Santos",
      type: "Limpeza",
      status: "confirmed",
      duration: 60,
    },
    {
      id: 2,
      time: "10:30",
      patient: "Carlos Mendes",
      dentist: "Dra. Ana Paula",
      type: "Consulta",
      status: "scheduled",
      duration: 30,
    },
    {
      id: 3,
      time: "14:00",
      patient: "Pedro Oliveira",
      dentist: "Dr. João Santos",
      type: "Canal",
      status: "confirmed",
      duration: 90,
    },
    {
      id: 4,
      time: "16:00",
      patient: "Julia Costa",
      dentist: "Dra. Ana Paula",
      type: "Clareamento",
      status: "scheduled",
      duration: 60,
    },
  ];

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
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
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
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{apt.time}</span>
                        <Badge className={statusColors[apt.status as keyof typeof statusColors]}>
                          {statusLabels[apt.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                      <p className="font-medium text-foreground">{apt.patient}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.type} • {apt.dentist} • {apt.duration} min
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
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