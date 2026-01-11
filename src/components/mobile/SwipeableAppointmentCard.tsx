import { useState, useRef } from "react";
import { useDrag } from "@use-gesture/react";
import { animated, useSpring } from "@react-spring/web";
import { Check, X, MessageCircle, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SwipeableAppointmentCardProps {
  appointment: {
    id: string;
    appointment_date: string;
    title: string;
    status: string | null;
    patient_id: string;
    patients: { full_name: string } | null;
    profissionais: { nome: string } | null;
  };
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onSendMessage: (id: string, patientId: string) => void;
  onClick: () => void;
}

const SWIPE_THRESHOLD = 80;

const SwipeableAppointmentCard = ({
  appointment,
  onConfirm,
  onCancel,
  onSendMessage,
  onClick,
}: SwipeableAppointmentCardProps) => {
  const [swiped, setSwiped] = useState<"left" | "right" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir], cancel }) => {
      if (swiped) return;

      // Limit swipe distance
      const clampedX = Math.max(-120, Math.min(120, mx));

      if (!down) {
        if (Math.abs(mx) > SWIPE_THRESHOLD) {
          const direction = xDir > 0 ? "right" : "left";
          setSwiped(direction);
          api.start({ x: direction === "right" ? 120 : -120 });

          // Auto-reset after action
          setTimeout(() => {
            setSwiped(null);
            api.start({ x: 0 });
          }, 300);

          // Trigger action
          if (direction === "right") {
            onConfirm(appointment.id);
          } else {
            onCancel(appointment.id);
          }
        } else {
          api.start({ x: 0 });
        }
      } else {
        api.start({ x: clampedX, immediate: true });
      }
    },
    { axis: "x", filterTaps: true }
  );

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case "confirmado":
        return "default";
      case "cancelado":
        return "destructive";
      case "concluido":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "confirmado":
        return "Confirmado";
      case "cancelado":
        return "Cancelado";
      case "concluido":
        return "Concluído";
      case "agendado":
        return "Agendado";
      default:
        return status || "Pendente";
    }
  };

  const patient = appointment.patients;
  const professional = appointment.profissionais;

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {/* Left action (confirm) - shown when swiping right */}
        <div className="flex-1 bg-green-500 flex items-center justify-start px-4">
          <div className="flex items-center gap-2 text-white">
            <Check className="h-6 w-6" />
            <span className="font-medium text-sm">Confirmar</span>
          </div>
        </div>
        {/* Right action (cancel) - shown when swiping left */}
        <div className="flex-1 bg-destructive flex items-center justify-end px-4">
          <div className="flex items-center gap-2 text-white">
            <span className="font-medium text-sm">Cancelar</span>
            <X className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main card */}
      <animated.div
        {...bind()}
        style={{ x, touchAction: "pan-y" }}
        className="relative"
      >
        <Card
          className={cn(
            "cursor-pointer active:scale-[0.98] transition-transform border-none shadow-sm",
            "touch-pan-y"
          )}
          onClick={onClick}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {patient?.full_name || "Paciente"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {appointment.title}
                {professional ? ` - ${professional.nome}` : ""}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-medium text-sm">
                {format(parseISO(appointment.appointment_date), "HH:mm", {
                  locale: ptBR,
                })}
              </p>
              <Badge
                variant={getStatusVariant(appointment.status)}
                className="text-xs mt-1"
              >
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendMessage(appointment.id, appointment.patient_id);
                }}
                className="p-2 rounded-full hover:bg-accent transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </button>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </animated.div>
    </div>
  );
};

export default SwipeableAppointmentCard;
