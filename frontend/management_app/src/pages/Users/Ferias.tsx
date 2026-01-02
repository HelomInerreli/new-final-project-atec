import { useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AbsenceStatsCards from "../../components/absences/AbsenceStatsCards";
import VacationCreateDialog from "../../components/absences/VacationCreateDialog";
import VacationTable, { type VacationRow } from "../../components/absences/VacationTable";
import { toast } from "sonner";
import { useEmployees } from "../../hooks/useEmployees";
import { useAbsences, useAbsenceTypes } from "../../hooks/useAbsences";
import { absenceService } from "../../services/absenceService";
import "../../styles/ServiceOrderDetail.css";

export default function Ferias() {
	const navigate = useNavigate();
	const { employees } = useEmployees();
	const { types } = useAbsenceTypes();
	const feriasTypeId = useMemo(() => types.find((t) => t.name.toLowerCase() === "férias")?.id, [types]);

	const { absences, refetch } = useAbsences(); // carrega todas e filtramos aqui

	type VacationRowWithIds = VacationRow & { ids: number[] };

	const rows: VacationRowWithIds[] = useMemo(() => {
		if (!feriasTypeId) return [];

		const ferias = absences
			.filter((a) => a.absence_type.id === feriasTypeId)
			.sort((a, b) => {
				if (a.employee.id !== b.employee.id) return a.employee.id - b.employee.id;
				return new Date(a.day).getTime() - new Date(b.day).getTime();
			});

		const grouped: VacationRowWithIds[] = [];
		let i = 0;
		while (i < ferias.length) {
			const start = ferias[i];
			const usuarioNome = start.employee.name;
			let startDate = new Date(start.day);
			let endDate = new Date(start.day);
			let status = start.status.name;
			const ids: number[] = [start.id];

			// Avança enquanto for mesmo funcionário e dias consecutivos
			let j = i + 1;
			while (
				j < ferias.length &&
				ferias[j].employee.id === start.employee.id &&
				new Date(ferias[j].day).getTime() === endDate.getTime() + 24 * 60 * 60 * 1000
			) {
				endDate = new Date(ferias[j].day);
				// Se status divergir, pode manter "Pendente" até aprovação total
				status = ferias[j].status.name; // ou decidir uma regra
				ids.push(ferias[j].id);
				j++;
			}

			// Mapeia status do backend para a UI
			const STATUS_MAP: Record<string, "pendente" | "aprovada" | "rejeitada"> = {
				Pendente: "pendente",
				Aprovado: "aprovada",
				Recusado: "rejeitada",
			};

			const diasUtilizados =
				Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

			grouped.push({
				id: `${ids[0]}`, // id de exibição
				ids,              // ids reais do período
				usuarioNome,
				dataInicio: startDate,
				dataFim: endDate,
				diasUtilizados,
				status: STATUS_MAP[status] ?? "pendente",
			});

			i = j;
		}

		return grouped;
	}, [absences, feriasTypeId]);

	const onConfirm = async ({
		employeeId,
		startDate,
		endDate,
	}: {
		employeeId: string;
		startDate: Date;
		endDate: Date;
	}) => {
		const days: string[] = [];
		const d = new Date(startDate);
		const end = new Date(endDate);
		while (d <= end) {
			days.push(d.toISOString().split("T")[0]);
			d.setDate(d.getDate() + 1);
		}
		if (!feriasTypeId) {
			toast.error("Tipo Férias não encontrado");
			return;
		}
		try {
			await absenceService.createBulk({
				employee_id: Number(employeeId),
				absence_type_id: feriasTypeId,
				status_id: 2, // Pendente
				days,
			});
			toast.success("Férias criadas");
			refetch();
		} catch (e) {
			toast.error("Erro ao criar férias");
		}
	};

	const handleApprove = async (id: string) => {
		const row = rows.find(r => r.id === id);
		if (!row) return;
		try {
			await Promise.all(row.ids.map(realId => absenceService.updateStatus(realId, 1)));
			toast.success("Férias aprovadas");
			refetch();
		} catch {
			toast.error("Falha ao aprovar");
		}
	};

	const handleReject = async (id: string) => {
		const row = rows.find(r => r.id === id);
		if (!row) return;
		try {
			await Promise.all(row.ids.map(realId => absenceService.updateStatus(realId, 3)));
			toast.success("Férias rejeitadas");
			refetch();
		} catch {
			toast.error("Falha ao rejeitar");
		}
	};

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center gap-4 mb-6">
				<button className="so-back-btn" onClick={() => navigate('/users')}>
					<ArrowLeft size={24} />
				</button>
				<div className="flex-1">
					<h1 className="text-3xl font-bold">Gestão de Férias</h1>
				</div>
				<VacationCreateDialog
					employees={employees.map((e) => ({ id: String(e.id), name: e.name }))}
					onConfirm={onConfirm}
				/>
			</div>

			<AbsenceStatsCards
				total={rows.length}
				approved={rows.filter((r) => r.status === "aprovada").length}
				pending={rows.filter((r) => r.status === "pendente").length}
				Icon={CalendarDays as any}
				titleTotal="Total de Férias"
				titleApproved="Aprovadas"
				titlePending="Pendentes"
			/>

			<Card>
				<CardHeader>
					<CardTitle>Lista de Férias</CardTitle>
				</CardHeader>
				<CardContent>
					<VacationTable rows={rows} onApprove={handleApprove} onReject={handleReject} />
				</CardContent>
			</Card>
		</div>
	);
}
