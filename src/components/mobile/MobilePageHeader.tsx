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
    <div className={cn(
      "sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border",
      "flex items-center gap-3 px-4 min-h-[56px] py-2",
      className
    )}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="lg:hidden p-2 -ml-2 rounded-btn press-scale hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      
      <div className="flex-1 min-w-0">
        <h1 className="text-section text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-caption text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export default MobilePageHeader;
