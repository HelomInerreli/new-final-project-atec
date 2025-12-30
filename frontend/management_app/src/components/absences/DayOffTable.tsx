import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type DayOffRow = {
  id: string;
  usuarioNome: string;
  data: Date;
  motivo: string;
  status: "pendente" | "aprovada" | "rejeitada";
};

type BadgeVariant = "default" | "secondary" | "destructive";

const statusVariantMap: Record<DayOffRow["status"], BadgeVariant> = {
  pendente: "secondary",
  aprovada: "default",
  rejeitada: "destructive",
};

const statusLabels: Record<DayOffRow["status"], string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};

interface DayOffTableProps {
  rows: DayOffRow[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function DayOffTable({ rows, onApprove, onReject }: DayOffTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left font-semibold text-base text-black">Colaborador</TableHead>
          <TableHead className="text-left font-semibold text-base text-black">Data</TableHead>
          <TableHead className="text-left font-semibold text-base text-black">Motivo</TableHead>
          <TableHead className="text-left font-semibold text-base text-black">Status</TableHead>
          <TableHead className="text-right font-semibold text-base text-black">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((f) => (
          <TableRow key={f.id}>
            <TableCell className="font-medium">{f.usuarioNome}</TableCell>
            <TableCell>{format(f.data, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
            <TableCell>{f.motivo}</TableCell>
            <TableCell>
              <Badge 
                variant={statusVariantMap[f.status]}
                className={
                  f.status === "pendente" ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                  f.status === "aprovada" ? "bg-green-600 hover:bg-green-700 text-white" :
                  ""
                }
              >
                {statusLabels[f.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {f.status === "pendente" && (
                <div className="flex justify-end gap-2">
                  {onApprove && (
                    <Button size="sm" variant="outline" onClick={() => onApprove(f.id)}>
                      Aprovar
                    </Button>
                  )}
                  {onReject && (
                    <Button size="sm" variant="destructive" onClick={() => onReject(f.id)}>
                      Rejeitar
                    </Button>
                  )}
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}