import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export const SidebarFilters = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const professionals = [
    { name: "Dr. João Silva", avatar: "JS", active: true },
    { name: "Dra. Maria Santos", avatar: "MS", active: true },
    { name: "Dr. Pedro Costa", avatar: "PC", active: false },
  ];

  const consultTypes = [
    { label: "Primeira Consulta", checked: true },
    { label: "Retorno", checked: true },
    { label: "Cirurgia", checked: false },
    { label: "Limpeza", checked: true },
  ];

  return (
    <div className="space-y-3">
      {/* Calendário compacto */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium">Calendário</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-0 text-xs [&_.rdp-months]:w-full [&_.rdp-caption]:text-xs [&_.rdp-day]:h-7 [&_.rdp-day]:w-7 [&_.rdp-day]:text-xs"
          />
        </CardContent>
      </Card>

      {/* Filtro de Profissionais */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium">Profissionais</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            {professionals.map((prof, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-1.5 rounded transition-colors cursor-pointer ${
                  prof.active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {prof.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate">{prof.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtro por Tipo de Consulta */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium">Tipo de Consulta</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            {consultTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox id={`type-${index}`} defaultChecked={type.checked} className="h-3.5 w-3.5" />
                <label
                  htmlFor={`type-${index}`}
                  className="text-xs font-medium leading-none cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botão de Novo Agendamento */}
      <Button
        size="lg"
        className="w-full h-12 text-sm font-semibold bg-[hsl(var(--flowdent-blue))] hover:bg-[hsl(var(--flow-turquoise))] shadow-md"
      >
        <Plus className="h-4 w-4 mr-2" />
        Novo Agendamento
      </Button>
    </div>
  );
};
