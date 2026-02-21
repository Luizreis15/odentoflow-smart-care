import { Link, useLocation } from "react-router-dom";
import { Calendar, Home, Users, DollarSign, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobileDrawerMenu from "./MobileDrawerMenu";
import CentralFAB from "./CentralFAB";
import { useState } from "react";

const navItemsLeft = [
  { name: "Início", href: "/dashboard", icon: Home },
  { name: "Agenda", href: "/dashboard/agenda", icon: Calendar },
];

const navItemsRight = [
  { name: "Pacientes", href: "/dashboard/prontuario", icon: Users },
];

interface MobileBottomNavProps {
  user?: {
    email?: string;
    full_name?: string;
  } | null;
}

const MobileBottomNav = ({ user }: MobileBottomNavProps) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const renderNavItem = (item: { name: string; href: string; icon: React.ElementType }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-colors flex-1",
          isActive
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
        <span className={cn("text-[10px] font-medium leading-tight", isActive && "text-primary")}>
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-end justify-around h-[72px] px-1">
        {/* Left side items */}
        {navItemsLeft.map(renderNavItem)}

        {/* Central FAB */}
        <div className="flex items-center justify-center flex-1">
          <CentralFAB />
        </div>

        {/* Right side items */}
        {navItemsRight.map(renderNavItem)}

        {/* More menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg text-muted-foreground transition-colors flex-1">
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">Mais</span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <MobileDrawerMenu user={user} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
