import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarItem {
  id: string;
  type: "pagar" | "receber";
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  supplier?: string;
  patient?: string;
}

interface CalendarioFinanceiroProps {
  clinicId: string;
}

export const CalendarioFinanceiro = ({ clinicId }: CalendarioFinanceiroProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [clinicId, currentDate]);

  const loadItems = async () => {
    try {
      setLoading(true);
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

      // Load payables
      const { data: payables, error: payablesError } = await supabase
        .from("payable_titles")
        .select(`
          id, description, amount, due_date, status,
          supplier:suppliers(razao_social, nome_fantasia)
        `)
        .eq("clinic_id", clinicId)
        .gte("due_date", startDate)
        .lte("due_date", endDate)
        .neq("status", "cancelled");

      if (payablesError) throw payablesError;

      // Load receivables
      const { data: receivables, error: receivablesError } = await supabase
        .from("receivable_titles")
        .select(`
          id, description, amount, due_date, status,
          patient:patients(nome)
        `)
        .eq("clinic_id", clinicId)
        .gte("due_date", startDate)
        .lte("due_date", endDate)
        .neq("status", "cancelled");

      if (receivablesError) throw receivablesError;

      const calendarItems: CalendarItem[] = [
        ...(payables || []).map((p: any) => ({
          id: p.id,
          type: "pagar" as const,
          description: p.description,
          amount: p.amount,
          dueDate: p.due_date,
          status: p.status,
          supplier: p.supplier?.nome_fantasia || p.supplier?.razao_social,
        })),
        ...(receivables || []).map((r: any) => ({
          id: r.id,
          type: "receber" as const,
          description: r.description,
          amount: r.amount,
          dueDate: r.due_date,
          status: r.status,
          patient: r.patient?.nome,
        })),
      ];

      setItems(calendarItems);
    } catch (error) {
      console.error("Erro ao carregar calendário:", error);
      toast.error("Erro ao carregar calendário");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startPadding = firstDay.getDay();
    
    // Add padding for days before the first day of month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getItemsForDay = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return items.filter(item => item.dueDate === dateStr);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const isOverdue = (dateStr: string, status: string) => {
    if (status === "paid" || status === "received") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    return dueDate < today;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // Summary calculations
  const totalPagar = items.filter(i => i.type === "pagar" && i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);
  const totalReceber = items.filter(i => i.type === "receber" && i.status !== "received").reduce((sum, i) => sum + i.amount, 0);
  const vencidos = items.filter(i => isOverdue(i.dueDate, i.status)).length;

  const days = getDaysInMonth();
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A Pagar no mês</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPagar)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A Receber no mês</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceber)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${vencidos > 0 ? "border-l-orange-500" : "border-l-gray-300"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Títulos Vencidos</p>
                <p className={`text-2xl font-bold ${vencidos > 0 ? "text-orange-600" : "text-gray-500"}`}>
                  {vencidos}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${vencidos > 0 ? "text-orange-400" : "text-gray-300"}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
            <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : (
            <>
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="min-h-[80px] md:min-h-[100px]" />;
                  }

                  const dayItems = getItemsForDay(date);
                  const hasOverdue = dayItems.some(item => isOverdue(item.dueDate, item.status));
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={`min-h-[80px] md:min-h-[100px] border rounded-lg p-1 md:p-2 ${
                        isToday(date) 
                          ? "bg-primary/10 border-primary" 
                          : hasOverdue 
                            ? "bg-red-50 border-red-200" 
                            : "bg-card"
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday(date) ? "text-primary" : ""}`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        <TooltipProvider>
                          {dayItems.slice(0, 3).map((item) => (
                            <Tooltip key={item.id}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`text-xs p-1 rounded truncate cursor-pointer ${
                                    item.type === "pagar"
                                      ? item.status === "paid"
                                        ? "bg-green-100 text-green-800 line-through"
                                        : isOverdue(item.dueDate, item.status)
                                          ? "bg-red-200 text-red-800"
                                          : "bg-red-100 text-red-700"
                                      : item.status === "received"
                                        ? "bg-green-100 text-green-800 line-through"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {item.type === "pagar" ? "↓" : "↑"} {formatCurrency(item.amount).replace("R$", "").trim()}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[200px]">
                                <div className="space-y-1">
                                  <p className="font-medium">{item.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.type === "pagar" ? item.supplier : item.patient}
                                  </p>
                                  <p className="font-medium">{formatCurrency(item.amount)}</p>
                                  {isOverdue(item.dueDate, item.status) && (
                                    <Badge variant="destructive" className="text-xs">Vencido</Badge>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </TooltipProvider>
                        
                        {dayItems.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayItems.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
              <span>A Pagar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
              <span>A Receber</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-200 border border-red-300" />
              <span>Vencido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200">
                <span className="block w-full h-px bg-green-800 rotate-[-10deg] mt-2" />
              </div>
              <span>Pago/Recebido</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
