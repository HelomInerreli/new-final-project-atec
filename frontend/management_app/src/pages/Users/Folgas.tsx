import { useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { ArrowLeft, Umbrella } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AbsenceStatsCards from "../../components/absences/AbsenceStatsCards";
import DayOffCreateDialog from "../../components/absences/DayOffCreateDialog";
import DayOffTable, { type DayOffRow } from "../../components/absences/DayOffTable";
import { toast } from "sonner";
import { useEmployees } from "../../hooks/useEmployees";
import { useAbsences, useAbsenceTypes } from "../../hooks/useAbsences";
import { absenceService } from "../../services/absenceService";

const STATUS_MAP: Record<string, "pendente" | "aprovada" | "rejeitada"> = {
  Pendente: "pendente",
  Aprovado: "aprovada",
  Recusado: "rejeitada",
};

export default function Folgas() {
  const navigate = useNavigate();
  const { employees } = useEmployees();
  const { types } = useAbsenceTypes();
  const folgaTypeId = useMemo(() => types.find(t => t.name.toLowerCase() === "folga")?.id, [types]);

  const { absences, refetch } = useAbsences();

  const rows: DayOffRow[] = useMemo(() => {
    if (!folgaTypeId) return [];
    return absences
      .filter(a => a.absence_type.id === folgaTypeId)
      .map(a => ({
        id: String(a.id),
        usuarioNome: a.employee.name,
        data: new Date(a.day),
        motivo: "", // se tiver campo de motivo no schema, mapeie aqui
        status: STATUS_MAP[a.status.name] ?? "pendente",
      }));
  }, [absences, folgaTypeId]);

  const onConfirm = async ({ employeeId, date, reason }: { employeeId: string; date: Date; reason: string }) => {
    if (!folgaTypeId) {
      toast.error("Tipo Folga não encontrado");
      return;
    }
    try {
      await absenceService.createBulk({
        employee_id: Number(employeeId),
        absence_type_id: folgaTypeId,
        status_id: 2,
        days: [date.toISOString().split("T")[0]],
      });
      toast.success("Folga criada");
      refetch();
    } catch {
      toast.error("Erro ao criar folga");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await absenceService.updateStatus(Number(id), 1);
      toast.success("Folga aprovada");
      refetch();
    } catch {
      toast.error("Falha ao aprovar");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await absenceService.updateStatus(Number(id), 3);
      toast.success("Folga rejeitada");
      refetch();
    } catch {
      toast.error("Falha ao rejeitar");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Gestão de Folgas</h1>
          <p className="text-muted-foreground mt-1">Visualize e gerencie as folgas dos colaboradores</p>
        </div>
        <DayOffCreateDialog
          employees={employees.map(e => ({ id: String(e.id), name: e.name }))}
          onConfirm={onConfirm}
        />
      </div>

      <AbsenceStatsCards
        total={rows.length}
        approved={rows.filter(r => r.status === "aprovada").length}
        pending={rows.filter(r => r.status === "pendente").length}
        Icon={Umbrella as any}
        titleTotal="Total de Folgas"
        titleApproved="Aprovadas"
        titlePending="Pendentes"
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Folgas</CardTitle>
          <CardDescription>Todas as folgas registradas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <DayOffTable rows={rows} onApprove={handleApprove} onReject={handleReject} />
        </CardContent>
      </Card>
    </div>
  );
}
