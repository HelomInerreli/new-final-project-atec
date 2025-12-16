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
          <TableHead>Colaborador</TableHead>
          <TableHead>Data Início</TableHead>
          <TableHead>Data Fim</TableHead>
          <TableHead>Dias</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((f) => (
          <TableRow key={f.id}>
            <TableCell className="font-medium">{f.usuarioNome}</TableCell>
            <TableCell>{format(f.dataInicio, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
            <TableCell>{format(f.dataFim, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
            <TableCell>{f.diasUtilizados} dias</TableCell>
            <TableCell>
              <Badge variant={statusVariantMap[f.status]}>
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