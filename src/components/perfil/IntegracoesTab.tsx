import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plug } from "lucide-react";

interface IntegracoesTabProps {
  userId: string;
}

const IntegracoesTab = ({ userId }: IntegracoesTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Integrações
          </CardTitle>
          <CardDescription>Conecte com serviços externos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Funcionalidade de gestão de integrações em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegracoesTab;
