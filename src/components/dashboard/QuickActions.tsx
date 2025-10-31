import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Package, Megaphone, MessageCircle, BarChart3, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuickActions = () => {
  const actions = [
    { icon: QrCode, label: "Cobrança Rápida", color: "text-accent" },
    { icon: Package, label: "Estoque", color: "text-secondary" },
    { icon: Megaphone, label: "Marketing", color: "text-primary" },
    { icon: MessageCircle, label: "WhatsApp", color: "text-accent" },
    { icon: BarChart3, label: "Relatórios", color: "text-primary" },
    { icon: MinusCircle, label: "Despesa", color: "text-destructive" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-4 hover:border-primary hover:bg-accent/10 transition-all"
            >
              <action.icon className={`h-6 w-6 mb-2 ${action.color}`} />
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
