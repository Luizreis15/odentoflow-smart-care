import { Card, CardContent } from "@/components/ui/card";

interface Metric {
  label: string;
  value: string | number;
  color: string;
}

interface MobileMetricsProps {
  metrics: Metric[];
}

const MobileMetrics = ({ metrics }: MobileMetricsProps) => {
  return (
    <div className="px-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="min-w-[130px] flex-shrink-0 border-none shadow-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-2 w-2 rounded-full ${metric.color}`} />
                <span className="text-xs text-muted-foreground truncate">
                  {metric.label}
                </span>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MobileMetrics;
