import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const UpcomingAppointments = () => {
  const appointments = [
    { time: "09:00", name: "Maria Silva", status: "confirmed", statusColor: "bg-primary" },
    { time: "10:30", name: "João Santos", status: "waiting", statusColor: "bg-yellow-500" },
    { time: "14:00", name: "Ana Paula", status: "confirmed", statusColor: "bg-primary" },
  ];

  return (
    <Card>
      <CardHeader className="p-2.5 pb-1.5">
        <CardTitle className="text-xs font-medium">Próximas Consultas</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-1.5">
          {appointments.map((apt, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className={`w-0.5 h-8 rounded-full ${apt.statusColor}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs truncate">{apt.name}</p>
                <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{apt.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
