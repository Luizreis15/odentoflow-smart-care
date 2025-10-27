import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Power, PowerOff, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Profissional {
  id: string;
  nome: string;
  cro: string | null;
  especialidade: string | null;
  email: string;
  telefone: string | null;
  perfil: string;
  ativo: boolean;
  user_id: string | null;
}

interface ProfissionaisTableProps {
  profissionais: Profissional[];
  loading: boolean;
  onEdit: (profissional: Profissional) => void;
  onToggleStatus: (profissional: Profissional) => void;
  onConfigAgenda: (profissional: Profissional) => void;
}

const perfilLabels: Record<string, string> = {
  responsavel: "Responsável",
  dentista: "Dentista",
  asb: "ASB",
  recepcao: "Recepção"
};

export const ProfissionaisTable = ({
  profissionais,
  loading,
  onEdit,
  onToggleStatus,
  onConfigAgenda
}: ProfissionaisTableProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (profissionais.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        Nenhum profissional encontrado
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CRO</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profissionais.map((prof) => (
            <TableRow key={prof.id}>
              <TableCell className="font-medium">{prof.nome}</TableCell>
              <TableCell>{prof.cro || "-"}</TableCell>
              <TableCell>{prof.especialidade || "-"}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{prof.email}</div>
                  {prof.telefone && (
                    <div className="text-muted-foreground">{prof.telefone}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {perfilLabels[prof.perfil] || prof.perfil}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={prof.ativo ? "default" : "secondary"}>
                  {prof.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(prof)}
                    title="Editar profissional"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConfigAgenda(prof)}
                    title="Configurar agenda"
                  >
                    <Calendar className="h-4 w-4 text-primary" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(prof)}
                    title={prof.ativo ? "Desativar" : "Ativar"}
                  >
                    {prof.ativo ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
