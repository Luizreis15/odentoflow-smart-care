import { Calendar, DollarSign, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Metric {
  label: string;
  value: string | number;
  color: string;
  type?: "appointments" | "revenue" | "patients" | "pending";
}

interface MobileMetricsProps {
  metrics: Metric[];
}

const getMetricConfig = (type: string) => {
  switch (type) {
    case "appointments":
      return {
        bgClass: "bg-[hsl(var(--card-blue))]",
        borderClass: "border-l-[hsl(var(--flowdent-blue))]",
        textClass: "text-[hsl(var(--flowdent-blue))]",
        icon: Calendar,
      };
    case "revenue":
      return {
        bgClass: "bg-[hsl(var(--card-green))]",
        borderClass: "border-l-[hsl(var(--success-green))]",
        textClass: "text-[hsl(var(--success-green))]",
        icon: DollarSign,
      };
    case "patients":
      return {
        bgClass: "bg-[hsl(var(--card-turquoise))]",
        borderClass: "border-l-[hsl(var(--flow-turquoise))]",
        textClass: "text-[hsl(var(--flow-turquoise))]",
        icon: Users,
      };
    case "pending":
      return {
        bgClass: "bg-[hsl(var(--card-amber))]",
        borderClass: "border-l-[hsl(var(--warning-amber))]",
        textClass: "text-[hsl(var(--warning-amber))]",
        icon: Clock,
      };
    default:
      return {
        bgClass: "bg-card",
        borderClass: "border-l-border",
        textClass: "text-foreground",
        icon: Calendar,
      };
  }
};

const MobileMetrics = ({ metrics }: MobileMetricsProps) => {
  return (
    <div className="w-full max-w-full px-4 overflow-hidden">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {metrics.map((metric, index) => {
          const config = getMetricConfig(metric.type || "");
          const Icon = config.icon;
          
          return (
            <div
              key={index}
              className={cn(
                "min-w-[130px] min-h-[80px] flex-shrink-0 rounded-card border-l-4 p-3 snap-start",
                "shadow-sm transition-shadow hover:shadow-md",
                config.bgClass,
                config.borderClass
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded-btn bg-white/60", config.textClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-caption text-foreground/70 truncate max-w-[70px]">
                  {metric.label}
                </span>
              </div>
              <p className={cn("text-xl font-bold", config.textClass)}>
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileMetrics;
