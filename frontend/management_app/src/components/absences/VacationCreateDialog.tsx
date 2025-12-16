import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

type EmployeeOpt = { id: string; name: string };

interface VacationCreateDialogProps {
  employees: EmployeeOpt[];
  onConfirm: (data: { employeeId: string; startDate: Date; endDate: Date }) => void | Promise<void>;
  triggerLabel?: string;
}

export default function VacationCreateDialog({
  employees,
  onConfirm,
  triggerLabel = "Marcar Férias",
}: VacationCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<string>("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  const handleConfirm = async () => {
    if (!selectedUsuario || !startDate || !endDate) {
      toast.error("Preencha todos os campos");
      return;
    }
    await onConfirm({ employeeId: selectedUsuario, startDate, endDate });
    setSelectedUsuario("");
    setDateRange([null, null]);
    setOpen(false);
    toast.success("Férias marcadas com sucesso!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Plus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Marcar Férias</DialogTitle>
          <DialogDescription>Selecione o colaborador e o período de férias</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Colaborador</label>
            <Select value={selectedUsuario} onValueChange={setSelectedUsuario}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um colaborador" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Período</label>
            <div className="relative">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update as [Date | null, Date | null])}
                isClearable
                monthsShown={2}
                locale={ptBR}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione o período"
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  !startDate && "text-muted-foreground"
                )}
                wrapperClassName="w-full"
              />
              <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}