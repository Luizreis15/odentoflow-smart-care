import { cn } from "@/lib/utils";

export type FaceStatus = "a_realizar" | "executado" | "existente" | null;

interface FaceOclusalProps {
  numero: number;
  faces: {
    vestibular: FaceStatus;
    mesial: FaceStatus;
    distal: FaceStatus;
    oclusal: FaceStatus;
    palatina: FaceStatus;
  };
  onFaceClick: (face: string) => void;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
}

const STATUS_COLORS: Record<string, string> = {
  a_realizar: "fill-red-500",
  executado: "fill-green-500",
  existente: "fill-blue-500",
};

export const FaceOclusal = ({ 
  numero, 
  faces, 
  onFaceClick, 
  selected = false,
  size = "md" 
}: FaceOclusalProps) => {
  const getSize = () => {
    switch (size) {
      case "sm": return "w-6 h-6";
      case "lg": return "w-10 h-10";
      default: return "w-8 h-8";
    }
  };

  const getFillClass = (face: FaceStatus) => {
    if (!face) return "fill-muted hover:fill-muted-foreground/30";
    return STATUS_COLORS[face] || "fill-muted";
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg
        viewBox="0 0 50 50"
        className={cn(
          getSize(),
          "transition-transform cursor-pointer",
          selected && "ring-2 ring-primary ring-offset-1 rounded"
        )}
      >
        {/* Vestibular - Topo */}
        <path
          d="M10 5 L40 5 L35 15 L15 15 Z"
          className={cn(
            "transition-all cursor-pointer stroke-border stroke-1",
            getFillClass(faces.vestibular)
          )}
          onClick={() => onFaceClick("vestibular")}
        />
        
        {/* Distal - Esquerda */}
        <path
          d="M5 10 L15 15 L15 35 L5 40 Z"
          className={cn(
            "transition-all cursor-pointer stroke-border stroke-1",
            getFillClass(faces.distal)
          )}
          onClick={() => onFaceClick("distal")}
        />
        
        {/* Oclusal - Centro */}
        <rect
          x="15"
          y="15"
          width="20"
          height="20"
          className={cn(
            "transition-all cursor-pointer stroke-border stroke-1",
            getFillClass(faces.oclusal)
          )}
          onClick={() => onFaceClick("oclusal")}
        />
        
        {/* Mesial - Direita */}
        <path
          d="M45 10 L35 15 L35 35 L45 40 Z"
          className={cn(
            "transition-all cursor-pointer stroke-border stroke-1",
            getFillClass(faces.mesial)
          )}
          onClick={() => onFaceClick("mesial")}
        />
        
        {/* Palatina/Lingual - Base */}
        <path
          d="M10 45 L40 45 L35 35 L15 35 Z"
          className={cn(
            "transition-all cursor-pointer stroke-border stroke-1",
            getFillClass(faces.palatina)
          )}
          onClick={() => onFaceClick("palatina")}
        />
      </svg>
    </div>
  );
};
