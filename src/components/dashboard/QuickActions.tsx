import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Package, Megaphone, MessageCircle, BarChart3, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuickActions = () => {
  const actions = [
    { icon: QrCode, label: "Cobrança", color: "text-accent" },
    { icon: Package, label: "Estoque", color: "text-secondary" },
    { icon: Megaphone, label: "Marketing", color: "text-primary" },
    { icon: MessageCircle, label: "WhatsApp", color: "text-accent" },
    { icon: BarChart3, label: "Relatórios", color: "text-primary" },
    { icon: MinusCircle, label: "Despesa", color: "text-destructive" },
  ];

  return (
    <Card>
      <CardHeader className="p-2.5 pb-1.5">
        <CardTitle className="text-xs font-medium">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-2 gap-1.5">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-2 hover:border-primary hover:bg-accent/10 transition-all"
            >
              <action.icon className={`h-4 w-4 mb-1 ${action.color}`} />
              <span className="text-xs font-medium text-center leading-tight">
                {action.label}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
