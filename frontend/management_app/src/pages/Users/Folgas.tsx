import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Umbrella, Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Textarea } from "../../components/ui/textarea";

type Folga = {
    id: string;
    usuarioId: string;
    usuarioNome: string;
    data: Date;
    motivo: string;
    status: "pendente" | "aprovada" | "rejeitada";
};

const initialFolgas: Folga[] = [
    {
        id: "1",
        usuarioId: "1",
        usuarioNome: "João Silva",
        data: new Date(2025, 0, 20),
        motivo: "Assuntos pessoais",
        status: "aprovada",
    },
    {
        id: "2",
        usuarioId: "2",
        usuarioNome: "Maria Santos",
        data: new Date(2025, 1, 5),
        motivo: "Consulta médica",
        status: "pendente",
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

export default function Folgas() {
    const navigate = useNavigate();
    const [folgas, setFolgas] = useState<Folga[]>(initialFolgas);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [motivo, setMotivo] = useState("");

    const handleMarcarFolga = () => {
        if (!selectedUsuario || !selectedDate || !motivo) {
            toast.error("Preencha todos os campos");
            return;
        }

        const novaFolga: Folga = {
            id: String(folgas.length + 1),
            usuarioId: selectedUsuario,
            usuarioNome: selectedUsuario === "1" ? "João Silva" : selectedUsuario === "2" ? "Maria Santos" : "Ana Costa",
            data: selectedDate,
            motivo,
            status: "pendente",
        };

        setFolgas([...folgas, novaFolga]);
        setIsDialogOpen(false);
        setSelectedUsuario("");
        setSelectedDate(undefined);
        setMotivo("");
        toast.success("Folga marcada com sucesso!");
    };

    const handleUpdateStatus = (id: string, newStatus: "aprovada" | "rejeitada") => {
        setFolgas(folgas.map(f => f.id === id ? { ...f, status: newStatus } : f));
        toast.success(`Folga ${newStatus === "aprovada" ? "aprovada" : "rejeitada"}`);
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <Plus className="mr-2 h-4 w-4" />
                            Marcar Folga
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
                                        <SelectItem value="1">João Silva</SelectItem>
                                        <SelectItem value="2">Maria Santos</SelectItem>
                                        <SelectItem value="3">Ana Costa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Data</label>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    locale={ptBR}
                                    className="rounded-md border"
                                />
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
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleMarcarFolga}>Confirmar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 mb-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Folgas</CardTitle>
                        <Umbrella className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{folgas.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                        <Umbrella className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{folgas.filter(f => f.status === "aprovada").length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                        <Umbrella className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{folgas.filter(f => f.status === "pendente").length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Folgas</CardTitle>
                    <CardDescription>Todas as folgas registradas no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Colaborador</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Motivo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {folgas.map((f) => (
                                <TableRow key={f.id}>
                                    <TableCell className="font-medium">{f.usuarioNome}</TableCell>
                                    <TableCell>{format(f.data, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                    <TableCell>{f.motivo}</TableCell>
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
