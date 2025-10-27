import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Financeiro = () => {
  const transactions = [
    {
      id: 1,
      type: "receita",
      description: "Consulta - Maria Silva",
      amount: 250.0,
      date: "2024-03-15",
      category: "Consulta",
      status: "pago",
    },
    {
      id: 2,
      type: "receita",
      description: "Clareamento - Carlos Mendes",
      amount: 800.0,
      date: "2024-03-14",
      category: "Estética",
      status: "pago",
    },
    {
      id: 3,
      type: "despesa",
      description: "Materiais Odontológicos",
      amount: 1200.0,
      date: "2024-03-13",
      category: "Fornecedores",
      status: "pago",
    },
    {
      id: 4,
      type: "receita",
      description: "Canal - Ana Paula Costa",
      amount: 1500.0,
      date: "2024-03-12",
      category: "Endodontia",
      status: "pendente",
    },
  ];

  const dentistPayments = [
    {
      name: "Dr. João Santos",
      totalConsultas: 45,
      totalReceita: 18750.0,
      repasse: 13125.0,
      percentual: 70,
    },
    {
      name: "Dra. Ana Paula",
      totalConsultas: 38,
      totalReceita: 15800.0,
      repasse: 11060.0,
      percentual: 70,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro e Faturamento</h1>
          <p className="text-muted-foreground mt-1">
            Controle completo de receitas, despesas e repasses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">R$ 45.230</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-secondary" />
              <p className="text-xs text-secondary">+12% vs. mês passado</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">R$ 18.450</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-destructive" />
              <p className="text-xs text-destructive">-5% vs. mês passado</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 26.780</div>
            <p className="text-xs text-muted-foreground mt-1">59.2% margem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">R$ 8.200</div>
            <p className="text-xs text-muted-foreground mt-1">15 pagamentos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Movimentações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="dentists">Repasse por Dentista</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Transações</CardTitle>
              <CardDescription>Receitas e despesas recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                        transaction.type === "receita"
                          ? "bg-secondary/10"
                          : "bg-destructive/10"
                      }`}
                    >
                      <DollarSign
                        className={`h-6 w-6 ${
                          transaction.type === "receita"
                            ? "text-secondary"
                            : "text-destructive"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">
                          {transaction.description}
                        </p>
                        <Badge
                          variant={
                            transaction.status === "pago" ? "default" : "secondary"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} •{" "}
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        transaction.type === "receita"
                          ? "text-secondary"
                          : "text-destructive"
                      }`}
                    >
                      {transaction.type === "receita" ? "+" : "-"}R${" "}
                      {transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>
                Análise detalhada por período e categoria
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">
                Relatórios financeiros em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dentists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Repasse por Dentista</CardTitle>
              <CardDescription>Cálculo automático de repasses mensais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dentistPayments.map((dentist, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-lg">{dentist.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {dentist.totalConsultas} consultas este mês
                        </p>
                      </div>
                      <Badge variant="outline">
                        {dentist.percentual}% repasse
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Receita Total</p>
                        <p className="text-xl font-bold">
                          R$ {dentist.totalReceita.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor do Repasse</p>
                        <p className="text-xl font-bold text-secondary">
                          R$ {dentist.repasse.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;