import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Star, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlanosTableProps {
  planos: any[];
  onSetPadrao: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

export const PlanosTable = ({ planos, onSetPadrao, onDelete, onEdit }: PlanosTableProps) => {
  if (planos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum plano cadastrado</p>
        <p className="text-sm mt-2">Crie seu primeiro plano personalizado</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Plano</TableHead>
            <TableHead>Ajuste</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Atualizado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planos.map((plano) => (
            <TableRow key={plano.id}>
              <TableCell className="font-medium">{plano.nome}</TableCell>
              <TableCell>
                {plano.percentual_ajuste > 0 ? (
                  <span className="text-green-600">+{plano.percentual_ajuste}%</span>
                ) : plano.percentual_ajuste < 0 ? (
                  <span className="text-red-600">{plano.percentual_ajuste}%</span>
                ) : (
                  <span className="text-muted-foreground">Base</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {plano.is_padrao && (
                    <Badge variant="default" className="gap-1">
                      <Star className="h-3 w-3" />
                      Padrão
                    </Badge>
                  )}
                  {plano.ativo ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600">
                      Inativo
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(plano.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  {!plano.is_padrao && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetPadrao(plano.id)}
                      className="gap-1"
                    >
                      <Star className="h-4 w-4" />
                      Definir Padrão
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o plano "{plano.nome}"?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(plano.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
