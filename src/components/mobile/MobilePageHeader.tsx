import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: React.ReactNode;
  className?: string;
}

const MobilePageHeader = ({
  title,
  subtitle,
  showBack = false,
  action,
  className,
}: MobilePageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("flex items-center gap-3 mb-4", className)}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      
      <div className="flex-1 min-w-0">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export default MobilePageHeader;
