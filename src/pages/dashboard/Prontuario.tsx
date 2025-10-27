import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Image, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Prontuario = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const patients = [
    {
      id: 1,
      name: "Maria Silva",
      lastVisit: "2024-03-15",
      totalVisits: 8,
      status: "ativo",
      nextAppointment: "2024-04-10",
    },
    {
      id: 2,
      name: "Carlos Mendes",
      lastVisit: "2024-03-10",
      totalVisits: 5,
      status: "ativo",
      nextAppointment: null,
    },
    {
      id: 3,
      name: "Ana Paula Costa",
      lastVisit: "2024-02-28",
      totalVisits: 12,
      status: "tratamento",
      nextAppointment: "2024-03-30",
    },
    {
      id: 4,
      name: "Pedro Oliveira",
      lastVisit: "2023-12-20",
      totalVisits: 3,
      status: "inativo",
      nextAppointment: null,
    },
  ];

  const recentRecords = [
    {
      id: 1,
      patient: "Maria Silva",
      date: "2024-03-15",
      type: "Consulta",
      dentist: "Dr. João Santos",
      notes: "Limpeza completa realizada. Sem problemas dentários.",
    },
    {
      id: 2,
      patient: "Carlos Mendes",
      date: "2024-03-10",
      type: "Canal",
      dentist: "Dra. Ana Paula",
      notes: "Início de tratamento de canal no dente 16.",
    },
  ];

  const statusColors = {
    ativo: "bg-secondary text-secondary-foreground",
    tratamento: "bg-primary/10 text-primary",
    inativo: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prontuário Digital</h1>
          <p className="text-muted-foreground mt-1">
            Histórico clínico completo dos pacientes
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Prontuário
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">248</div>
            <p className="text-xs text-muted-foreground mt-1">+18 este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Tratamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">32</div>
            <p className="text-xs text-muted-foreground mt-1">12.9% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prontuários Atualizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">198</div>
            <p className="text-xs text-muted-foreground mt-1">79.8% completos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anexos Salvos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.2k</div>
            <p className="text-xs text-muted-foreground mt-1">Imagens e docs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Paciente</CardTitle>
          <CardDescription>Encontre prontuários por nome, CPF ou telefone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome do paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="treatment">Em Tratamento</TabsTrigger>
          <TabsTrigger value="inactive">Inativos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pacientes</CardTitle>
              <CardDescription>Lista completa de prontuários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{patient.name}</p>
                        <Badge className={statusColors[patient.status as keyof typeof statusColors]}>
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Última visita: {new Date(patient.lastVisit).toLocaleDateString("pt-BR")}</span>
                        <span>•</span>
                        <span>{patient.totalVisits} consultas</span>
                        {patient.nextAppointment && (
                          <>
                            <span>•</span>
                            <span>Próxima: {new Date(patient.nextAppointment).toLocaleDateString("pt-BR")}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Prontuário
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">Filtro de pacientes ativos</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment">
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">Filtro de pacientes em tratamento</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">Filtro de pacientes inativos</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Atendimentos</CardTitle>
          <CardDescription>Prontuários recentemente atualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="flex gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/20">
                  <FileText className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{record.patient}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {record.type} • {record.dentist}
                  </p>
                  <p className="text-sm mt-2">{record.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prontuario;