import { cn } from "@/lib/utils";
import { FaceStatus } from "./FaceOclusal";

interface DenteVestibularProps {
  numero: number;
  status: FaceStatus;
  onClick?: () => void;
  arcada: "superior" | "inferior";
}

const STATUS_COLORS: Record<string, string> = {
  a_realizar: "fill-red-400 stroke-red-600",
  executado: "fill-green-400 stroke-green-600",
  existente: "fill-blue-400 stroke-blue-600",
};

export const DenteVestibular = ({ numero, status, onClick, arcada }: DenteVestibularProps) => {
  const getFillClass = () => {
    if (!status) return "fill-muted stroke-muted-foreground/50";
    return STATUS_COLORS[status] || "fill-muted stroke-muted-foreground/50";
  };

  // Dentes anteriores (incisivos e caninos) têm formato diferente
  const isAnterior = [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43, 51, 52, 53, 61, 62, 63, 71, 72, 73, 81, 82, 83].includes(numero);
  
  // Rotação para arcada inferior
  const rotation = arcada === "inferior" ? "rotate(180)" : "";

  return (
    <div 
      className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 32"
        className="w-6 h-8"
        style={{ transform: rotation }}
      >
        {isAnterior ? (
          // Dente anterior (incisivo/canino)
          <path
            d="M12 2C8 2 5 5 5 9C5 14 6 22 8 26C9 28 11 30 12 30C13 30 15 28 16 26C18 22 19 14 19 9C19 5 16 2 12 2Z"
            className={cn("transition-all stroke-2", getFillClass())}
          />
        ) : (
          // Dente posterior (pré-molar/molar)
          <>
            <path
              d="M6 4C4 4 3 6 3 8C3 12 4 18 5 22C6 26 8 30 12 30C16 30 18 26 19 22C20 18 21 12 21 8C21 6 20 4 18 4"
              className={cn("transition-all stroke-2", getFillClass())}
            />
            <path
              d="M6 4C8 4 10 3 12 3C14 3 16 4 18 4"
              className={cn("transition-all stroke-2", getFillClass())}
            />
            {/* Raízes para molares */}
            <line x1="8" y1="28" x2="8" y2="30" className="stroke-muted-foreground/30 stroke-1" />
            <line x1="16" y1="28" x2="16" y2="30" className="stroke-muted-foreground/30 stroke-1" />
          </>
        )}
      </svg>
    </div>
  );
};
