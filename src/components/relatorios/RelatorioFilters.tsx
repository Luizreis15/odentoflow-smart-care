import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  dentistId: string | null;
  especialidade: string | null;
  status: string | null;
}

interface Props {
  clinicId: string;
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

const statusOptions = [
  { value: "realizado", label: "Realizado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "remarcado", label: "Remarcado" },
  { value: "faltou", label: "Faltou" },
];

const RelatorioFilters = ({ clinicId, filters, onFiltersChange }: Props) => {
  const [dentistas, setDentistas] = useState<{ id: string; nome: string }[]>([]);
  const [especialidades, setEspecialidades] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const { data: profs } = await supabase
        .from("profissionais")
        .select("id, nome, especialidade")
        .eq("clinica_id", clinicId)
        .eq("ativo", true);

      if (profs) {
        setDentistas(profs.map((p) => ({ id: p.id, nome: p.nome })));
        const esps = [...new Set(profs.map((p) => p.especialidade).filter(Boolean))] as string[];
        setEspecialidades(esps);
      }
    };
    fetchOptions();
  }, [clinicId]);

  const handleClear = () => {
    onFiltersChange({
      ...filters,
      dentistId: null,
      especialidade: null,
      status: null,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-lg">
      <Filter className="h-4 w-4 text-muted-foreground" />

      {/* Start Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("w-[140px] justify-start text-left text-xs font-normal")}>
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
            {format(filters.startDate, "dd/MM/yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.startDate}
            onSelect={(d) => d && onFiltersChange({ ...filters, startDate: d })}
            locale={ptBR}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground">até</span>

      {/* End Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("w-[140px] justify-start text-left text-xs font-normal")}>
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
            {format(filters.endDate, "dd/MM/yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.endDate}
            onSelect={(d) => d && onFiltersChange({ ...filters, endDate: d })}
            locale={ptBR}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Dentist */}
      <Select
        value={filters.dentistId || "all"}
        onValueChange={(v) => onFiltersChange({ ...filters, dentistId: v === "all" ? null : v })}
      >
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <SelectValue placeholder="Dentista" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos dentistas</SelectItem>
          {dentistas.map((d) => (
            <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Specialty */}
      <Select
        value={filters.especialidade || "all"}
        onValueChange={(v) => onFiltersChange({ ...filters, especialidade: v === "all" ? null : v })}
      >
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <SelectValue placeholder="Especialidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas especialidades</SelectItem>
          {especialidades.map((e) => (
            <SelectItem key={e} value={e}>{e}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={filters.status || "all"}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v === "all" ? null : v })}
      >
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos status</SelectItem>
          {statusOptions.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(filters.dentistId || filters.especialidade || filters.status) && (
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs h-9">
          <X className="h-3.5 w-3.5 mr-1" /> Limpar
        </Button>
      )}
    </div>
  );
};

export default RelatorioFilters;
