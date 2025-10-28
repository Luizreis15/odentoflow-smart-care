import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ContratosAssinaturasTabProps {
  userId: string;
}

const ContratosAssinaturasTab = ({ userId }: ContratosAssinaturasTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos da Conta
          </CardTitle>
          <CardDescription>Contratos e termos relacionados à sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Funcionalidade de gestão de contratos e assinaturas em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContratosAssinaturasTab;
