import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface ListaTratamentosSectionProps {
  tratamentos: any[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  valorTotal: number;
  valorSelecionado: number;
  desconto: number;
  onDescontoChange: (value: number) => void;
  total: number;
}

export const ListaTratamentosSection = ({
  tratamentos,
  onToggle,
  onRemove,
  valorTotal,
  valorSelecionado,
  desconto,
  onDescontoChange,
  total,
}: ListaTratamentosSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-muted-foreground">Lista de tratamentos</h3>

      <div className="border rounded-lg">
        <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 font-medium text-sm">
          <div className="col-span-1"></div>
          <div className="col-span-8">Tratamento</div>
          <div className="col-span-2 text-right">Valor</div>
          <div className="col-span-1"></div>
        </div>

        {tratamentos.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum tratamento adicionado
          </div>
        ) : (
          tratamentos.map((tratamento) => (
            <div
              key={tratamento.id}
              className="grid grid-cols-12 gap-4 p-3 border-t items-center hover:bg-muted/30"
            >
              <div className="col-span-1">
                <Checkbox
                  checked={tratamento.checked}
                  onCheckedChange={() => onToggle(tratamento.id)}
                />
              </div>
              <div className="col-span-8">
                <p className="font-medium">{tratamento.nome}</p>
                {tratamento.dentista_nome && (
                  <p className="text-sm text-muted-foreground">
                    Dr(a). {tratamento.dentista_nome}
                  </p>
                )}
                {tratamento.dente_regiao && (
                  <p className="text-xs text-muted-foreground">
                    Dente/Região: {tratamento.dente_regiao}
                  </p>
                )}
              </div>
              <div className="col-span-2 text-right font-medium">
                R$ {tratamento.valor.toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(tratamento.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Valor total orçamento</span>
          <span className="font-semibold">R$ {valorTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Valor selecionado</span>
          <span className="font-semibold">R$ {valorSelecionado.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <Button
            variant="link"
            className="text-blue-600 p-0 h-auto"
            onClick={() => {
              const valorDesconto = prompt("Digite o valor do desconto:");
              if (valorDesconto) {
                onDescontoChange(parseFloat(valorDesconto));
              }
            }}
          >
            + Adicionar desconto
          </Button>
          {desconto > 0 && (
            <span className="text-red-600 font-semibold">
              - R$ {desconto.toFixed(2)}
            </span>
          )}
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
