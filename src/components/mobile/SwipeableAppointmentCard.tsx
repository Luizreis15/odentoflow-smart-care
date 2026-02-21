import { useState, useRef } from "react";
import { useDrag } from "@use-gesture/react";
import { animated, useSpring } from "@react-spring/web";
import { Check, X, MessageCircle, Clock, ChevronRight, User } from "lucide-react";
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

  const getStatusConfig = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "confirmado":
        return {
          variant: "default" as const,
          label: "Confirmado",
          borderClass: "border-l-4 border-l-[hsl(var(--success-green))]",
          bgClass: "bg-[hsl(var(--card-green))]",
          avatarClass: "bg-[hsl(var(--success-green))]/20 text-[hsl(var(--success-green))]",
        };
      case "cancelled":
      case "cancelado":
        return {
          variant: "destructive" as const,
          label: "Cancelado",
          borderClass: "border-l-4 border-l-[hsl(var(--error-red))]",
          bgClass: "bg-red-50",
          avatarClass: "bg-[hsl(var(--error-red))]/20 text-[hsl(var(--error-red))]",
        };
      case "completed":
      case "concluido":
        return {
          variant: "secondary" as const,
          label: "Concluído",
          borderClass: "border-l-4 border-l-muted-foreground",
          bgClass: "bg-muted/50",
          avatarClass: "bg-muted text-muted-foreground",
        };
      case "scheduled":
      case "agendado":
        return {
          variant: "outline" as const,
          label: "Agendado",
          borderClass: "border-l-4 border-l-[hsl(var(--flowdent-blue))]",
          bgClass: "bg-[hsl(var(--card-blue))]",
          avatarClass: "bg-[hsl(var(--flowdent-blue))]/20 text-[hsl(var(--flowdent-blue))]",
        };
      case "no_show":
        return {
          variant: "destructive" as const,
          label: "Faltou",
          borderClass: "border-l-4 border-l-[hsl(var(--error-red))]",
          bgClass: "bg-red-50",
          avatarClass: "bg-[hsl(var(--error-red))]/20 text-[hsl(var(--error-red))]",
        };
      case "waiting":
        return {
          variant: "outline" as const,
          label: "Aguardando",
          borderClass: "border-l-4 border-l-[hsl(var(--warning-amber))]",
          bgClass: "bg-[hsl(var(--card-amber))]",
          avatarClass: "bg-[hsl(var(--warning-amber))]/20 text-[hsl(var(--warning-amber))]",
        };
      default:
        return {
          variant: "outline" as const,
          label: status || "Pendente",
          borderClass: "border-l-4 border-l-[hsl(var(--warning-amber))]",
          bgClass: "bg-[hsl(var(--card-amber))]",
          avatarClass: "bg-[hsl(var(--warning-amber))]/20 text-[hsl(var(--warning-amber))]",
        };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  const patient = appointment.patients;
  const professional = appointment.profissionais;
  const patientInitials = patient?.full_name
    ? patient.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")
    : "P";

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {/* Left action (confirm) - shown when swiping right */}
        <div className="flex-1 bg-gradient-to-r from-[hsl(var(--success-green))] to-emerald-500 flex items-center justify-start px-4">
          <div className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-full bg-white/20">
              <Check className="h-5 w-5" />
            </div>
            <span className="font-medium text-sm">Confirmar</span>
          </div>
        </div>
        {/* Right action (cancel) - shown when swiping left */}
        <div className="flex-1 bg-gradient-to-l from-[hsl(var(--error-red))] to-red-500 flex items-center justify-end px-4">
          <div className="flex items-center gap-2 text-white">
            <span className="font-medium text-sm">Cancelar</span>
            <div className="p-2 rounded-full bg-white/20">
              <X className="h-5 w-5" />
            </div>
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
            "cursor-pointer active:scale-[0.98] transition-transform border-none shadow-md",
            "touch-pan-y",
            statusConfig.borderClass,
            statusConfig.bgClass
          )}
          onClick={onClick}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm",
              statusConfig.avatarClass
            )}>
              {patientInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-foreground">
                {patient?.full_name || "Paciente"}
              </p>
              <p className="text-sm text-foreground/60 truncate">
                {appointment.title}
                {professional ? ` • ${professional.nome}` : ""}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm text-foreground">
                {format(parseISO(appointment.appointment_date), "HH:mm", {
                  locale: ptBR,
                })}
              </p>
              <Badge
                variant={statusConfig.variant}
                className="text-xs mt-1"
              >
                {statusConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendMessage(appointment.id, appointment.patient_id);
                }}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-[hsl(var(--flowdent-blue))]" />
              </button>
              <ChevronRight className="h-5 w-5 text-foreground/40" />
            </div>
          </CardContent>
        </Card>
      </animated.div>
    </div>
  );
};

export default SwipeableAppointmentCard;
