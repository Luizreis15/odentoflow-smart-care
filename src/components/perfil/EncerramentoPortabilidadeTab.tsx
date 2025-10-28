import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface EncerramentoPortabilidadeTabProps {
  userId: string;
}

const EncerramentoPortabilidadeTab = ({ userId }: EncerramentoPortabilidadeTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Encerramento & Portabilidade
          </CardTitle>
          <CardDescription>Exportar dados ou encerrar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Funcionalidade de encerramento de conta e portabilidade de dados em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncerramentoPortabilidadeTab;
