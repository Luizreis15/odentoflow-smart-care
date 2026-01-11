import { Card, CardContent } from "@/components/ui/card";
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
        bgClass: "bg-[hsl(var(--card-blue))] border-l-4 border-l-[hsl(var(--flowdent-blue))]",
        textClass: "text-[hsl(var(--flowdent-blue))]",
        icon: Calendar,
      };
    case "revenue":
      return {
        bgClass: "bg-[hsl(var(--card-green))] border-l-4 border-l-[hsl(var(--success-green))]",
        textClass: "text-[hsl(var(--success-green))]",
        icon: DollarSign,
      };
    case "patients":
      return {
        bgClass: "bg-[hsl(var(--card-turquoise))] border-l-4 border-l-[hsl(var(--flow-turquoise))]",
        textClass: "text-[hsl(var(--flow-turquoise))]",
        icon: Users,
      };
    case "pending":
      return {
        bgClass: "bg-[hsl(var(--card-amber))] border-l-4 border-l-[hsl(var(--warning-amber))]",
        textClass: "text-[hsl(var(--warning-amber))]",
        icon: Clock,
      };
    default:
      return {
        bgClass: "bg-card",
        textClass: "text-foreground",
        icon: Calendar,
      };
  }
};

const MobileMetrics = ({ metrics }: MobileMetricsProps) => {
  return (
    <div className="px-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {metrics.map((metric, index) => {
          const config = getMetricConfig(metric.type || "");
          const Icon = config.icon;
          
          return (
            <Card
              key={index}
              className={cn(
                "min-w-[140px] flex-shrink-0 border-none shadow-md transition-all hover:shadow-lg",
                config.bgClass
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-1.5 rounded-lg bg-white/60", config.textClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-foreground/70 truncate">
                    {metric.label}
                  </span>
                </div>
                <p className={cn("text-2xl font-bold", config.textClass)}>
                  {metric.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MobileMetrics;
