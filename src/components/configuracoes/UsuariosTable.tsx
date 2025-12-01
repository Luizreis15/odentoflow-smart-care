import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  cargo?: string;
  perfil: string;
}

interface UsuariosTableProps {
  usuarios: Usuario[];
  loading: boolean;
  onEdit: (usuario: Usuario) => void;
  onToggleStatus: (usuario: Usuario) => void;
}

const perfilLabels: Record<string, string> = {
  admin: "Administrador",
  recepcionista: "Recepcionista",
  asb: "ASB",
  cirurgiao_dentista: "Cirurgião-Dentista",
  dentista: "Dentista",
  recepcao: "Recepção",
  assistente: "Assistente"
};

const perfilColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  recepcionista: "bg-blue-100 text-blue-800",
  asb: "bg-green-100 text-green-800",
  cirurgiao_dentista: "bg-purple-100 text-purple-800",
  dentista: "bg-purple-100 text-purple-800",
  recepcao: "bg-blue-100 text-blue-800",
  assistente: "bg-green-100 text-green-800"
};

export const UsuariosTable = ({ usuarios, loading, onEdit, onToggleStatus }: UsuariosTableProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.nome}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.cargo || "-"}</TableCell>
              <TableCell>
                <Badge className={perfilColors[user.perfil] || ""}>
                  {perfilLabels[user.perfil] || user.perfil}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
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
