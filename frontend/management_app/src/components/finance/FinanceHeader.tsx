import { Button } from "../ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface FinanceHeaderProps {
    startDate: Date | null;
    endDate: Date | null;
    loading: boolean;
    onStartDateChange: (date: Date | null) => void;
    onEndDateChange: (date: Date | null) => void;
    onFilter: () => void;
}

export function FinanceHeader({
    startDate,
    endDate,
    loading,
    onStartDateChange,
    onEndDateChange,
    onFilter,
}: FinanceHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                <p className="text-muted-foreground">
                    Visão geral financeira da oficina
                </p>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => onStartDateChange(date)}
                        isClearable
                        locale={ptBR}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Data inicial"
                        className={cn(
                            "flex h-10 w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            !startDate && "text-muted-foreground"
                        )}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <span className="text-gray-500">até</span>
                <div className="relative">
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => onEndDateChange(date)}
                        isClearable
                        locale={ptBR}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Data final"
                        minDate={startDate || undefined}
                        className={cn(
                            "flex h-10 w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            !endDate && "text-muted-foreground"
                        )}
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button onClick={onFilter} disabled={loading}>
                    {loading ? "Carregando..." : "Filtrar"}
                </Button>
            </div>
        </div>
    );
}
