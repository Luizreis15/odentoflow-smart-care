import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface OdontogramaProps {
  dentesSelecionados: string[];
  onDentesChange: (dentes: string[]) => void;
}

// Dentes permanentes FDI
const DENTES_PERMANENTES = {
  superior: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  inferior: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
};

// Dentes decíduos
const DENTES_DECIDUOS = {
  superior: [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
  inferior: [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
};

// Ícone SVG de dente simplificado
const ToothIcon = ({ selected, onClick }: { selected: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "relative w-8 h-10 transition-all hover:scale-110",
      selected && "scale-110"
    )}
  >
    <svg
      viewBox="0 0 24 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "w-full h-full transition-all",
        selected ? "drop-shadow-lg" : "opacity-70 hover:opacity-100"
      )}
    >
      <path
        d="M12 2C8 2 4 4 4 8C4 10 4 14 4 18C4 22 6 30 12 30C18 30 20 22 20 18C20 14 20 10 20 8C20 4 16 2 12 2Z"
        className={cn(
          "transition-all",
          selected
            ? "fill-primary stroke-primary"
            : "fill-background stroke-muted-foreground"
        )}
        strokeWidth="2"
      />
      <path
        d="M10 8C10 8 10 12 10 14M14 8C14 8 14 12 14 14"
        className={cn(
          "transition-all",
          selected ? "stroke-primary-foreground" : "stroke-muted-foreground"
        )}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  </button>
);

export const Odontograma = ({ dentesSelecionados, onDentesChange }: OdontogramaProps) => {
  const [activeTab, setActiveTab] = useState("permanentes");

  const toggleDente = (dente: number) => {
    const denteStr = dente.toString();
    if (dentesSelecionados.includes(denteStr)) {
      onDentesChange(dentesSelecionados.filter(d => d !== denteStr));
    } else {
      onDentesChange([...dentesSelecionados, denteStr]);
    }
  };

  const selecionarRegiao = (regiao: string) => {
    let novosDentes: string[] = [];
    
    switch (regiao) {
      case "maxila":
        novosDentes = DENTES_PERMANENTES.superior.map(d => d.toString());
        break;
      case "mandibula":
        novosDentes = DENTES_PERMANENTES.inferior.map(d => d.toString());
        break;
      case "face":
        // Dentes anteriores (incisivos e caninos)
        novosDentes = [
          ...DENTES_PERMANENTES.superior.filter(d => d >= 11 && d <= 13 || d >= 21 && d <= 23),
          ...DENTES_PERMANENTES.inferior.filter(d => d >= 31 && d <= 33 || d >= 41 && d <= 43),
        ].map(d => d.toString());
        break;
      case "arcada_superior":
        novosDentes = DENTES_PERMANENTES.superior.map(d => d.toString());
        break;
      case "arcada_inferior":
        novosDentes = DENTES_PERMANENTES.inferior.map(d => d.toString());
        break;
      case "arcadas":
        novosDentes = [
          ...DENTES_PERMANENTES.superior,
          ...DENTES_PERMANENTES.inferior,
        ].map(d => d.toString());
        break;
    }

    // Toggle: se todos já estão selecionados, desseleciona; senão, seleciona todos
    const todosJaSelecionados = novosDentes.every(d => dentesSelecionados.includes(d));
    
    if (todosJaSelecionados) {
      onDentesChange(dentesSelecionados.filter(d => !novosDentes.includes(d)));
    } else {
      const dentesUnicos = Array.from(new Set([...dentesSelecionados, ...novosDentes]));
      onDentesChange(dentesUnicos);
    }
  };

  const limparSelecao = () => {
    onDentesChange([]);
  };

  const renderDentePermanente = (dentes: number[], label: string) => (
    <div className="space-y-2">
      <div className="flex justify-center gap-1">
        {dentes.map(dente => (
          <div key={dente} className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">{dente}</span>
            <ToothIcon
              selected={dentesSelecionados.includes(dente.toString())}
              onClick={() => toggleDente(dente)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Selecionar Dente/Região</h4>
        {dentesSelecionados.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={limparSelecao}
            className="text-xs"
          >
            Limpar ({dentesSelecionados.length})
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="permanentes">PERMANENTES</TabsTrigger>
          <TabsTrigger value="deciduos">DECÍDUOS</TabsTrigger>
          <TabsTrigger value="hof">HOF</TabsTrigger>
        </TabsList>

        <TabsContent value="permanentes" className="space-y-6 mt-4">
          <div className="space-y-4">
            {renderDentePermanente(DENTES_PERMANENTES.superior, "Superior")}
            <div className="border-t my-4" />
            {renderDentePermanente(DENTES_PERMANENTES.inferior, "Inferior")}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selecionarRegiao("maxila")}
            >
              Maxila
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selecionarRegiao("mandibula")}
            >
              Mandíbula
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selecionarRegiao("face")}
            >
              Face
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selecionarRegiao("arcada_superior")}
            >
              Arcada superior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selecionarRegiao("arcada_inferior")}
            >
              Arcada inferior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selecionarRegiao("arcadas")}
            >
              Arcadas
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="deciduos" className="space-y-6 mt-4">
          <div className="space-y-4">
            {renderDentePermanente(DENTES_DECIDUOS.superior, "Superior")}
            <div className="border-t my-4" />
            {renderDentePermanente(DENTES_DECIDUOS.inferior, "Inferior")}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const dentesDecSup = DENTES_DECIDUOS.superior.map(d => d.toString());
                const todosJaSelecionados = dentesDecSup.every(d => dentesSelecionados.includes(d));
                if (todosJaSelecionados) {
                  onDentesChange(dentesSelecionados.filter(d => !dentesDecSup.includes(d)));
                } else {
                  onDentesChange(Array.from(new Set([...dentesSelecionados, ...dentesDecSup])));
                }
              }}
            >
              Arcada superior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const dentesDecInf = DENTES_DECIDUOS.inferior.map(d => d.toString());
                const todosJaSelecionados = dentesDecInf.every(d => dentesSelecionados.includes(d));
                if (todosJaSelecionados) {
                  onDentesChange(dentesSelecionados.filter(d => !dentesDecInf.includes(d)));
                } else {
                  onDentesChange(Array.from(new Set([...dentesSelecionados, ...dentesDecInf])));
                }
              }}
            >
              Arcada inferior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const todosDentes = [
                  ...DENTES_DECIDUOS.superior,
                  ...DENTES_DECIDUOS.inferior,
                ].map(d => d.toString());
                const todosJaSelecionados = todosDentes.every(d => dentesSelecionados.includes(d));
                if (todosJaSelecionados) {
                  onDentesChange(dentesSelecionados.filter(d => !todosDentes.includes(d)));
                } else {
                  onDentesChange(Array.from(new Set([...dentesSelecionados, ...todosDentes])));
                }
              }}
            >
              Arcadas
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="hof" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Hemisfério Orofacial - Seleção rápida de regiões
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => selecionarRegiao("maxila")}
              className="h-20"
            >
              <div className="text-center">
                <div className="font-semibold">Maxila</div>
                <div className="text-xs text-muted-foreground">Arcada superior completa</div>
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => selecionarRegiao("mandibula")}
              className="h-20"
            >
              <div className="text-center">
                <div className="font-semibold">Mandíbula</div>
                <div className="text-xs text-muted-foreground">Arcada inferior completa</div>
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => selecionarRegiao("face")}
              className="h-20"
            >
              <div className="text-center">
                <div className="font-semibold">Face</div>
                <div className="text-xs text-muted-foreground">Dentes anteriores</div>
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => selecionarRegiao("arcadas")}
              className="h-20"
            >
              <div className="text-center">
                <div className="font-semibold">Arcadas</div>
                <div className="text-xs text-muted-foreground">Todos os dentes</div>
              </div>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {dentesSelecionados.length > 0 && (
        <div className="pt-3 border-t">
          <p className="text-sm text-muted-foreground mb-2">Selecionados:</p>
          <div className="flex flex-wrap gap-2">
            {dentesSelecionados.sort((a, b) => parseInt(a) - parseInt(b)).map(dente => (
              <span
                key={dente}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium"
              >
                {dente}
                <button
                  type="button"
                  onClick={() => toggleDente(parseInt(dente))}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
