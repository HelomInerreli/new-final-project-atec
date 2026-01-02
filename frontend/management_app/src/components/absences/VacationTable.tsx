import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type VacationRow = {
  id: string;
  usuarioNome: string;
  dataInicio: Date;
  dataFim: Date;
  diasUtilizados: number;
  status: "pendente" | "aprovada" | "rejeitada";
};

type BadgeVariant = "default" | "secondary" | "destructive";

const statusVariantMap: Record<VacationRow["status"], BadgeVariant> = {
  pendente: "secondary",
  aprovada: "default",
  rejeitada: "destructive",
};

const statusLabels: Record<VacationRow["status"], string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};

interface VacationTableProps {
  rows: VacationRow[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function VacationTable({ rows, onApprove, onReject }: VacationTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center font-semibold text-base text-black">Colaborador</TableHead>
          <TableHead className="text-left font-semibold text-base text-black">Data Início</TableHead>
          <TableHead className="text-left font-semibold text-base text-black">Data Fim</TableHead>
          <TableHead className="text-left font-semibold text-base text-black">Dias</TableHead>
          <TableHead className="text-left font-semibold text-base text-black">Status</TableHead>
          <TableHead className="text-center font-semibold text-base text-black">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((f) => (
          <TableRow key={f.id}>
            <TableCell className="text-center font-medium">{f.usuarioNome}</TableCell>
            <TableCell className="text-left">{format(f.dataInicio, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
            <TableCell className="text-left">{format(f.dataFim, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
            <TableCell className="text-left">{f.diasUtilizados} dias</TableCell>
            <TableCell className="text-left">
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
            <TableCell className="text-center">
              {f.status === "pendente" && (
                <div className="flex justify-center gap-2">
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