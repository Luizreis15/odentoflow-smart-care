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
    <div className="space-y-4">
      {/* Calendário */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-0"
          />
        </CardContent>
      </Card>

      {/* Filtro de Profissionais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {professionals.map((prof, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                  prof.active ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {prof.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{prof.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtro por Tipo de Consulta */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tipo de Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {consultTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox id={`type-${index}`} defaultChecked={type.checked} />
                <label
                  htmlFor={`type-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
        className="w-full h-14 text-base font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Novo Agendamento
      </Button>
    </div>
  );
};
