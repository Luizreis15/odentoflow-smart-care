import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AgendaCalendar = () => {
  const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  const appointments = [
    { day: 0, hour: "09:00", patient: "Maria Silva", procedure: "Limpeza", status: "confirmed" },
    { day: 0, hour: "14:00", patient: "João Santos", procedure: "Canal", status: "waiting" },
    { day: 1, hour: "10:00", patient: "Ana Paula", procedure: "Consulta", status: "confirmed" },
    { day: 2, hour: "15:00", patient: "Carlos Mendes", procedure: "Extração", status: "completed" },
    { day: 3, hour: "11:00", patient: "Fernanda Lima", procedure: "Ortodontia", status: "confirmed" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-primary/90 hover:bg-primary border-primary/20";
      case "waiting": return "bg-yellow-500/90 hover:bg-yellow-500 border-yellow-400/20";
      case "completed": return "bg-accent/90 hover:bg-accent border-accent/20";
      case "paid": return "bg-green-600/90 hover:bg-green-600 border-green-500/20";
      case "missed": return "bg-destructive/90 hover:bg-destructive border-destructive/20";
      default: return "bg-muted";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base lg:text-lg">Agenda da Semana</CardTitle>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-8 text-xs">Hoje</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">Semana</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">Dia</Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 lg:p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header com dias da semana */}
            <div className="grid grid-cols-[60px_repeat(5,1fr)] gap-1.5 mb-2">
              <div className="text-xs font-medium text-muted-foreground"></div>
              {weekDays.map((day, index) => (
                <div key={index} className="text-center py-1">
                  <div className="text-xs lg:text-sm font-semibold">{day}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(Date.now() + index * 86400000).getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid de horários */}
            <div className="space-y-1">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-[60px_repeat(5,1fr)] gap-1.5">
                  <div className="text-xs font-medium text-muted-foreground flex items-center justify-end pr-2">
                    {hour}
                  </div>
                  {weekDays.map((_, dayIndex) => {
                    const apt = appointments.find(
                      (a) => a.day === dayIndex && a.hour === hour
                    );
                    
                    return (
                      <div
                        key={dayIndex}
                        className="min-h-[50px] lg:min-h-[56px] rounded border border-muted-foreground/10 hover:border-primary/30 transition-colors bg-muted/30"
                      >
                        {apt && (
                          <div
                            className={`h-full p-1.5 lg:p-2 rounded ${getStatusColor(
                              apt.status
                            )} text-white transition-all cursor-pointer shadow-sm`}
                          >
                            <div className="text-xs font-semibold truncate">
                              {apt.patient}
                            </div>
                            <div className="text-xs opacity-90 truncate">
                              {apt.procedure}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-3 lg:gap-4 mt-3 pt-3 border-t flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-primary"></div>
            <span className="text-xs text-muted-foreground">Confirmado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-yellow-500"></div>
            <span className="text-xs text-muted-foreground">Aguardando</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-accent"></div>
            <span className="text-xs text-muted-foreground">Concluído</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-green-600"></div>
            <span className="text-xs text-muted-foreground">Pago</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-destructive"></div>
            <span className="text-xs text-muted-foreground">Faltou</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
