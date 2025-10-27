import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, MessageCircle, CreditCard } from "lucide-react";

const PortalPaciente = () => {
  const portalStats = {
    activeUsers: 182,
    monthlyLogins: 456,
    appointmentsScheduled: 89,
    messagesReceived: 234,
  };

  const recentActivities = [
    {
      patient: "Maria Silva",
      action: "Confirmou consulta",
      date: "2024-03-15 14:30",
      type: "appointment",
    },
    {
      patient: "Carlos Mendes",
      action: "Enviou mensagem",
      date: "2024-03-15 11:20",
      type: "message",
    },
    {
      patient: "Ana Paula Costa",
      action: "Visualizou orçamento",
      date: "2024-03-14 16:45",
      type: "document",
    },
    {
      patient: "Pedro Oliveira",
      action: "Reagendou consulta",
      date: "2024-03-14 09:15",
      type: "appointment",
    },
  ];

  const features = [
    {
      icon: Calendar,
      title: "Agendamento Online",
      description: "Pacientes podem marcar e reagendar consultas",
      status: "Ativo",
    },
    {
      icon: FileText,
      title: "Histórico de Atendimentos",
      description: "Acesso ao prontuário e documentos",
      status: "Ativo",
    },
    {
      icon: CreditCard,
      title: "Pagamentos Online",
      description: "Consulta e pagamento de orçamentos",
      status: "Em desenvolvimento",
    },
    {
      icon: MessageCircle,
      title: "Chat com a Clínica",
      description: "Comunicação direta e moderada",
      status: "Ativo",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portal do Paciente</h1>
          <p className="text-muted-foreground mt-1">
            Área exclusiva para pacientes gerenciarem seus atendimentos
          </p>
        </div>
        <Button size="sm">
          <Users className="mr-2 h-4 w-4" />
          Gerenciar Acessos
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{portalStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">73% dos pacientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Logins este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{portalStats.monthlyLogins}</div>
            <p className="text-xs text-muted-foreground mt-1">2.5 por usuário</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agendamentos Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {portalStats.appointmentsScheduled}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mensagens Recebidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{portalStats.messagesReceived}</div>
            <p className="text-xs text-muted-foreground mt-1">Tempo médio: 2h</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades do Portal</CardTitle>
            <CardDescription>
              Recursos disponíveis para os pacientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{feature.title}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          feature.status === "Ativo"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {feature.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas interações dos pacientes no portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">
                      {activity.patient.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.patient}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Link do Portal</CardTitle>
          <CardDescription>
            Compartilhe este link com seus pacientes para acessarem o portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-2 rounded-lg border bg-muted text-sm font-mono">
              https://flowdent.app/portal
            </div>
            <Button variant="outline">Copiar Link</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Cada paciente receberá credenciais de acesso por email após o primeiro
            cadastro no sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalPaciente;