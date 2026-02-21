import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable, DataTableColumn } from "@/components/desktop/DataTable";

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
  onResendInvite: (usuario: Usuario) => void;
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

export const UsuariosTable = ({ usuarios, loading, onEdit, onToggleStatus, onResendInvite }: UsuariosTableProps) => {
  const columns: DataTableColumn<Usuario>[] = [
    { key: "nome", label: "Nome", sortable: true, className: "font-medium" },
    { key: "email", label: "E-mail", sortable: true },
    { key: "cargo", label: "Cargo", sortable: true },
    {
      key: "perfil",
      label: "Perfil",
      sortable: true,
      render: (user) => (
        <Badge className={perfilColors[user.perfil] || ""}>
          {perfilLabels[user.perfil] || user.perfil}
        </Badge>
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      className: "text-right",
      render: (user) => (
        <TooltipProvider>
          <div className="flex justify-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => onResendInvite(user)}>
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Reenviar convite</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Editar usuário</p></TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={usuarios}
      isLoading={loading}
      searchPlaceholder="Buscar usuário..."
      emptyMessage="Nenhum usuário encontrado"
    />
  );
};
