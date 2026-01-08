import { LucideIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FABProps {
  onClick: () => void;
  icon?: LucideIcon;
  label?: string;
  className?: string;
}

const FAB = ({ onClick, icon: Icon = Plus, label, className }: FABProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "lg:hidden fixed right-4 bottom-20 z-40 h-14 w-14 rounded-full shadow-lg",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "flex items-center justify-center",
        label && "w-auto px-4 gap-2",
        className
      )}
      size="icon"
    >
      <Icon className="h-6 w-6" />
      {label && <span className="font-medium">{label}</span>}
    </Button>
  );
};

export default FAB;
