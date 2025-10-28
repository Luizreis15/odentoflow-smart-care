import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface LogsAuditoriaTabProps {
  userId: string;
}

const LogsAuditoriaTab = ({ userId }: LogsAuditoriaTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Logs & Auditoria
          </CardTitle>
          <CardDescription>Histórico de ações e atividades</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Funcionalidade de logs e auditoria em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsAuditoriaTab;
