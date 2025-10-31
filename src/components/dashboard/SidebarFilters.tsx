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
    <div className="space-y-3 w-full">
      {/* Calendário */}
      <Card className="w-full">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-medium">Calendário</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-0 w-full [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full"
          />
        </CardContent>
      </Card>

      {/* Filtro de Profissionais */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            {professionals.map((prof, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition-colors ${
                  prof.active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Avatar className="h-6 w-6">
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

      {/* Filtro Tipo */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-medium">Tipo</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            {consultTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox id={`type-${index}`} defaultChecked={type.checked} />
                <label htmlFor={`type-${index}`} className="text-sm cursor-pointer">
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
        className="w-full font-semibold bg-[hsl(var(--flowdent-blue))] hover:bg-[hsl(var(--flow-turquoise))]"
      >
        <Plus className="h-4 w-4 mr-2" />
        Novo Agendamento
      </Button>
    </div>
  );
};
