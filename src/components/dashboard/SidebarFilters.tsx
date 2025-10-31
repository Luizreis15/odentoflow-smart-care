import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const SidebarFilters = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();

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
    <div className="space-y-6 w-full">
      {/* Calendário */}
      <Card className="w-full">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-semibold">Calendário</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="w-full overflow-hidden">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-0 w-full [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full [&_.rdp-caption]:text-sm [&_.rdp-day]:h-9 [&_.rdp-day]:w-9 [&_.rdp-day]:text-sm [&_.rdp-head_cell]:text-xs [&_.rdp-head_cell]:p-1 [&_.rdp-cell]:p-0.5 [&_table]:border-spacing-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filtro de Profissionais */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-semibold">Profissionais</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            {professionals.map((prof, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer ${
                  prof.active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {prof.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium truncate leading-relaxed">{prof.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtro Tipo */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-semibold">Tipo</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            {consultTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox id={`type-${index}`} defaultChecked={type.checked} className="h-4 w-4" />
                <label htmlFor={`type-${index}`} className="text-sm cursor-pointer leading-relaxed">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botão */}
      <Button 
        size="default" 
        onClick={() => navigate("/dashboard/agenda")}
        className="w-full mt-6 text-sm font-semibold bg-[hsl(var(--flowdent-blue))] hover:bg-[hsl(var(--flow-turquoise))]"
      >
        <Plus className="h-4 w-4 mr-2" />
        Novo Agendamento
      </Button>
    </div>
  );
};
