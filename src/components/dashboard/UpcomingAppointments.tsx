import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const UpcomingAppointments = () => {
  const appointments = [
    { time: "09:00", name: "Maria Silva", status: "confirmed", statusColor: "bg-primary" },
    { time: "10:30", name: "João Santos", status: "waiting", statusColor: "bg-yellow-500" },
    { time: "14:00", name: "Ana Paula", status: "confirmed", statusColor: "bg-primary" },
    { time: "15:30", name: "Carlos Mendes", status: "confirmed", statusColor: "bg-primary" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Próximas Consultas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {appointments.map((apt, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-1 h-12 rounded-full ${apt.statusColor}`} />
                <div>
                  <p className="font-medium text-sm text-foreground">{apt.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{apt.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
