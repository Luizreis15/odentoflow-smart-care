import { Link, useLocation } from "react-router-dom";
import { Calendar, FileText, DollarSign, LayoutDashboard, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobileDrawerMenu from "./MobileDrawerMenu";
import { useState } from "react";

const navItems = [
  { name: "Início", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { name: "Pacientes", href: "/dashboard/prontuario", icon: FileText },
  { name: "Financeiro", href: "/dashboard/financeiro", icon: DollarSign },
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

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn("text-[10px] font-medium", isActive && "text-primary")}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors min-w-[60px]">
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium">Mais</span>
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
