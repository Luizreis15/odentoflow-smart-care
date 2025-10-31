import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, Users, TrendingUp, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const CRM = () => {
  const navigate = useNavigate();
  const campaigns = [
    {
      id: 1,
      name: "Recall de Limpeza",
      type: "recall",
      status: "ativa",
      sent: 45,
      responses: 32,
      scheduled: 28,
    },
    {
      id: 2,
      name: "Aniversários do Mês",
      type: "aniversario",
      status: "agendada",
      sent: 0,
      responses: 0,
      scheduled: 18,
    },
    {
      id: 3,
      name: "Retorno de Tratamento",
      type: "retorno",
      status: "concluida",
      sent: 65,
      responses: 48,
      scheduled: 42,
    },
  ];

  const automations = [
    {
      name: "Confirmação de Consulta",
      trigger: "24h antes",
      channel: "WhatsApp",
      active: true,
    },
    {
      name: "Lembrete de Retorno",
      trigger: "6 meses após",
      channel: "Email",
      active: true,
    },
    {
      name: "Pesquisa de Satisfação",
      trigger: "Após consulta",
      channel: "SMS",
      active: false,
    },
  ];

  const npsStats = {
    score: 8.5,
    promoters: 75,
    neutrals: 18,
    detractors: 7,
    totalResponses: 156,
  };

  const statusColors = {
    ativa: "bg-secondary text-secondary-foreground",
    agendada: "bg-primary/10 text-primary",
    concluida: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM Odontológico</h1>
          <p className="text-muted-foreground mt-1">
            Relacionamento automático e campanhas personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/dashboard/crm/atendimento")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Atendimento WhatsApp
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              NPS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{npsStats.score}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {npsStats.totalResponses} respostas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mensagens Enviadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.2k</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-secondary" />
              <p className="text-xs text-secondary">+18% este mês</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground mt-1">Acima da média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Automações Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Fluxos ativos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="automations">Automações</TabsTrigger>
          <TabsTrigger value="nps">NPS & Satisfação</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas</CardTitle>
              <CardDescription>
                Fluxos de recall, retorno e relacionamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{campaign.name}</p>
                        <Badge
                          className={statusColors[campaign.status as keyof typeof statusColors]}
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Enviadas: </span>
                          <span className="font-medium">{campaign.sent}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Respostas: </span>
                          <span className="font-medium">{campaign.responses}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Agendadas: </span>
                          <span className="font-medium text-secondary">
                            {campaign.scheduled}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxos Automáticos</CardTitle>
              <CardDescription>
                Mensagens disparadas automaticamente por gatilhos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automations.map((automation, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/10">
                      <Sparkles className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{automation.name}</p>
                        <Badge
                          variant={automation.active ? "default" : "secondary"}
                        >
                          {automation.active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gatilho: {automation.trigger} • Canal: {automation.channel}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nps" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>NPS Score Atual</CardTitle>
                <CardDescription>Net Promoter Score da clínica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-6xl font-bold text-secondary mb-2">
                    {npsStats.score}
                  </div>
                  <p className="text-muted-foreground">
                    Baseado em {npsStats.totalResponses} respostas
                  </p>
                </div>
                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Promotores</span>
                    <span className="font-medium text-secondary">{npsStats.promoters}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Neutros</span>
                    <span className="font-medium">{npsStats.neutrals}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Detratores</span>
                    <span className="font-medium text-destructive">{npsStats.detractors}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pesquisas de Satisfação</CardTitle>
                <CardDescription>
                  Feedback dos pacientes sobre atendimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/10 border-l-4 border-secondary">
                    <p className="text-sm font-medium mb-1">Comentário Recente</p>
                    <p className="text-sm text-muted-foreground">
                      "Excelente atendimento! A Dra. Ana é muito atenciosa e o
                      ambiente é muito confortável."
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Maria Silva • Nota 10
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted border">
                    <p className="text-sm font-medium mb-1">Comentário Recente</p>
                    <p className="text-sm text-muted-foreground">
                      "Muito bom, mas a sala de espera poderia ter mais revistas."
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Carlos Mendes • Nota 8
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRM;