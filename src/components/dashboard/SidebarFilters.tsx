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
    <div className="space-y-2.5 w-full">
      {/* Calendário ultra compacto */}
      <Card className="w-full">
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-xs font-medium">Calendário</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full overflow-hidden">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-0 w-full scale-95 origin-center [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full [&_.rdp-caption]:text-xs [&_.rdp-day]:h-5 [&_.rdp-day]:w-5 [&_.rdp-day]:text-[10px] [&_.rdp-head_cell]:text-[10px] [&_.rdp-head_cell]:p-0 [&_.rdp-cell]:p-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filtro de Profissionais compacto */}
      <Card>
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-xs font-medium">Profissionais</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="space-y-1">
            {professionals.map((prof, index) => (
              <div
                key={index}
                className={`flex items-center gap-1.5 p-1 rounded text-xs cursor-pointer ${
                  prof.active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {prof.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium truncate">{prof.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtro Tipo - mais compacto */}
      <Card>
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-xs font-medium">Tipo</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="space-y-1.5">
            {consultTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <Checkbox id={`type-${index}`} defaultChecked={type.checked} className="h-3 w-3" />
                <label htmlFor={`type-${index}`} className="text-xs cursor-pointer">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botão compacto */}
      <Button 
        size="sm" 
        onClick={() => navigate("/dashboard/agenda")}
        className="w-full h-9 text-xs font-semibold bg-[hsl(var(--flowdent-blue))] hover:bg-[hsl(var(--flow-turquoise))]"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Novo Agendamento
      </Button>
    </div>
  );
};
