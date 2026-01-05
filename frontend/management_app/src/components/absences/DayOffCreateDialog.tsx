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
import { CalendarIcon, Plus, X } from "lucide-react";
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
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 rounded-t-lg m-0 !flex-row items-center justify-between !space-y-0">
          <DialogTitle className="text-white text-2xl font-bold">Marcar Folga</DialogTitle>
          <button 
            type="button"
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all focus:outline-none flex-shrink-0 relative z-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-white" strokeWidth={2.5} />
          </button>
        </DialogHeader>
        <div className="space-y-4 py-4 px-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Colaborador *</label>
            <Select value={selectedUsuario} onValueChange={setSelectedUsuario}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione um colaborador" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Data *</label>
            <div className="relative w-full">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                isClearable
                locale={ptBR}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione a data"
                minDate={new Date()}
                className={cn(
                  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  !selectedDate && "text-muted-foreground"
                )}
                wrapperClassName="w-full"
              />
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Motivo *</label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo da folga..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter className="px-6 pb-6 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="border-2 border-gray-300">Cancelar</Button>
          <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}