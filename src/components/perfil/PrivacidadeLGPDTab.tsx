import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface PrivacidadeLGPDTabProps {
  userId: string;
}

const PrivacidadeLGPDTab = ({ userId }: PrivacidadeLGPDTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacidade & LGPD
          </CardTitle>
          <CardDescription>Gestão de consentimentos e dados pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Funcionalidade de gestão de privacidade e LGPD em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacidadeLGPDTab;
