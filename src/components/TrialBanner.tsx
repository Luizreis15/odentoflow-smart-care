import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrialBannerProps {
  daysLeft: number;
}

export default function TrialBanner({ daysLeft }: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!isVisible) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Redirecionar para a página de preços
      navigate("/precos");
    } catch (error) {
      console.error("Erro ao redirecionar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível redirecionar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles className="h-5 w-5 shrink-0" />
            <p className="text-sm md:text-base font-medium">
              <span className="hidden md:inline">
                Você está no período de teste gratuito! Restam{" "}
                <strong>{daysLeft} dias</strong>.{" "}
              </span>
              <span className="md:hidden">
                <strong>{daysLeft} dias</strong> de teste restantes.{" "}
              </span>
              Escolha seu plano e continue aproveitando todos os recursos.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUpgrade}
              disabled={loading}
              className="shrink-0"
            >
              {loading ? "Aguarde..." : "Assinar agora"}
            </Button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors shrink-0"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
