import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "../ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "../ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

type EmployeeOpt = { id: string; name: string };

interface DayOffCreateDialogProps {
  employees: EmployeeOpt[];
  onConfirm: (data: { employeeId: string; date: Date; reason: string }) => void | Promise<void>;
  triggerLabel?: string;
}

export default function DayOffCreateDialog({
  employees,
  onConfirm,
  triggerLabel = "Marcar Folga",
}: DayOffCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [motivo, setMotivo] = useState("");

  const handleConfirm = async () => {
    if (!selectedUsuario || !selectedDate || !motivo) {
      toast.error("Preencha todos os campos");
      return;
    }
    await onConfirm({ employeeId: selectedUsuario, date: selectedDate, reason: motivo });
    setSelectedUsuario("");
    setSelectedDate(null);
    setMotivo("");
    setOpen(false);
    toast.success("Folga marcada com sucesso!");
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
          <DialogTitle>Marcar Folga</DialogTitle>
          <DialogDescription>Selecione o colaborador, a data e o motivo da folga</DialogDescription>
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
            <label className="text-sm font-medium mb-2 block">Data</label>
            <div className="relative w-full">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                isClearable
                locale={ptBR}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione a data"
                minDate={new Date()} // bloqueia datas anteriores a hoje
                // filterDate={(d) => d >= new Date()} // opcional redundante
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  !selectedDate && "text-muted-foreground"
                )}
                wrapperClassName="w-full"
              />
              <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Motivo</label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo da folga..."
              rows={3}
            />
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