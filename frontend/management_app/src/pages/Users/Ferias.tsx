import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calender";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { CalendarDays, Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Ferias = {
    id: string;
    usuarioId: string;
    usuarioNome: string;
    dataInicio: Date;
    dataFim: Date;
    status: "pendente" | "aprovada" | "rejeitada";
    diasUtilizados: number;
};

const initialFerias: Ferias[] = [
    {
        id: "1",
        usuarioId: "1",
        usuarioNome: "João Silva",
        dataInicio: new Date(2025, 0, 15),
        dataFim: new Date(2025, 0, 29),
        status: "aprovada",
        diasUtilizados: 15,
    },
    {
        id: "2",
        usuarioId: "2",
        usuarioNome: "Maria Santos",
        dataInicio: new Date(2025, 1, 1),
        dataFim: new Date(2025, 1, 10),
        status: "pendente",
        diasUtilizados: 10,
    },
];

const statusVariants = {
    pendente: "secondary",
    aprovada: "default",
    rejeitada: "destructive",
} as const;

const statusLabels = {
    pendente: "Pendente",
    aprovada: "Aprovada",
    rejeitada: "Rejeitada",
};

export default function Ferias() {
    const navigate = useNavigate();
    const [ferias, setFerias] = useState<Ferias[]>(initialFerias);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<string>("");
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });

    const handleMarcarFerias = () => {
        if (!selectedUsuario || !dateRange.from || !dateRange.to) {
            toast.error("Preencha todos os campos");
            return;
        }

        const diasUtilizados = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const novasFerias: Ferias = {
            id: String(ferias.length + 1),
            usuarioId: selectedUsuario,
            usuarioNome: selectedUsuario === "1" ? "João Silva" : selectedUsuario === "2" ? "Maria Santos" : "Ana Costa",
            dataInicio: dateRange.from,
            dataFim: dateRange.to,
            status: "pendente",
            diasUtilizados,
        };

        setFerias([...ferias, novasFerias]);
        setIsDialogOpen(false);
        setSelectedUsuario("");
        setDateRange({ from: undefined, to: undefined });
        toast.success("Férias marcadas com sucesso!");
    };

    const handleUpdateStatus = (id: string, newStatus: "aprovada" | "rejeitada") => {
        setFerias(ferias.map(f => f.id === id ? { ...f, status: newStatus } : f));
        toast.success(`Férias ${newStatus === "aprovada" ? "aprovadas" : "rejeitadas"}`);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={() => navigate('/users')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Gestão de Férias</h1>
                    <p className="text-muted-foreground mt-1">Visualize e gerencie as férias dos colaboradores</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <Plus className="mr-2 h-4 w-4" />
                            Marcar Férias
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
                                        <SelectItem value="1">João Silva</SelectItem>
                                        <SelectItem value="2">Maria Santos</SelectItem>
                                        <SelectItem value="3">Ana Costa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Período</label>
                                <div className="flex justify-center">
                                    <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                        locale={ptBR}
                                        className="rounded-md border w-fit"
                                        numberOfMonths={1}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleMarcarFerias}>Confirmar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 mb-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Férias</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ferias.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ferias.filter(f => f.status === "aprovada").length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ferias.filter(f => f.status === "pendente").length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Férias</CardTitle>
                    <CardDescription>Todas as férias registradas no sistema</CardDescription>
                </CardHeader>
                <CardContent>
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
                            {ferias.map((f) => (
                                <TableRow key={f.id}>
                                    <TableCell className="font-medium">{f.usuarioNome}</TableCell>
                                    <TableCell>{format(f.dataInicio, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                    <TableCell>{format(f.dataFim, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                    <TableCell>{f.diasUtilizados} dias</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariants[f.status]}>
                                            {statusLabels[f.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {f.status === "pendente" && (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(f.id, "aprovada")}>
                                                    Aprovar
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(f.id, "rejeitada")}>
                                                    Rejeitar
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
