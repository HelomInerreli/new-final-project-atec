import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Umbrella, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useEmployees } from "../../hooks/useEmployees";
import { useRoles } from "../../hooks/useRoles";
import type { Employee } from "../../interfaces/Employee";
import { Skeleton } from "../../components/ui/skeleton";
import CreateEmployeeModal from "../../components/CreateEmployeeModal";
import "../../components/inputs.css";

const roleVariants: { [key: string]: "destructive" | "default" | "secondary" | "outline" } = {
    Gestor: "destructive",
    Mecanico: "default",
    Eletricista: "secondary",
    Borracheiro: "outline",
} as const;

export default function Users() {
    const navigate = useNavigate();
    const { employees, loading, error, updateEmployee, removeEmployee, refetch } = useEmployees();
    const { roles } = useRoles();

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(null);
    const [page, setPage] = useState<number>(1);
    const pageSize = 5;

    const filteredEmployees = employees.filter((employee) => {
        const matchesSearch =
            `${employee.name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || employee.role.id === parseInt(roleFilter);
        return matchesSearch && matchesRole;
    });

    // reset page when filters/search change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, roleFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
    const paginatedEmployees = filteredEmployees.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const handleEdit = (employee: Employee) => {
        // TODO: Implement edit modal
        console.log("Edit employee:", employee);
        toast.info("Funcionalidade de edição em desenvolvimento");
    };

    const handleDeleteClick = (id: number) => {
        setDeletingEmployeeId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingEmployeeId) {
            toast.promise(removeEmployee(deletingEmployeeId), {
                loading: 'A apagar funcionário...',
                success: 'Funcionário apagado com sucesso!',
                error: 'Erro ao apagar funcionário.',
            });
        }
        setIsDeleteDialogOpen(false);
        setDeletingEmployeeId(null);
    };

    return (
        <div className="flex-1 space-y-6 p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 leading-tight">Funcionários</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-2 border-red-600" onClick={() => navigate('/ferias')}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Férias
                    </Button>
                    <Button variant="outline" className="border-2 border-red-600" onClick={() => navigate('/folgas')}>
                        <Umbrella className="h-4 w-4 mr-2" />
                        Folgas
                    </Button>
                    <Button variant="destructive" className="border-red-500" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Funcionário
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="mb-input-wrapper flex-1">
                    <div style={{ position: "relative" }}>
                        <Search
                            size={20}
                            style={{
                                position: "absolute",
                                left: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#6b7280",
                                pointerEvents: "none",
                                zIndex: 1,
                            }}
                        />
                        <input
                            type="text"
                            placeholder=""
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-input"
                            style={{ paddingLeft: "46px", borderColor: "#dc3545" }}
                            onFocus={(e) =>
                                e.target.nextElementSibling?.classList.add("shrunken")
                            }
                            onBlur={(e) => {
                                if (!e.target.value) {
                                    e.target.nextElementSibling?.classList.remove("shrunken");
                                }
                            }}
                        />
                        <label
                            className={`mb-input-label ${searchTerm ? "shrunken" : ""}`}
                            style={{ left: "46px" }}
                        >
                            Pesquisar por nome ou email...
                        </label>
                    </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] border-2 border-red-600 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0" style={{ height: "56px" }}>
                        <SelectValue placeholder="Filtrar por função" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Funções</SelectItem>
                        {roles.map(role => (
                            <SelectItem key={role.id} value={String(role.id)}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div
                className="rounded-md border-2 border-red-600"
                style={{
                    overflowY: "auto",
                    backgroundColor: "#fff",
                    borderRadius: "0.375rem",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    minHeight: 0,
                }}
            >
                <Table>
                    <TableHeader
                        style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                            background: "#fff",
                        }}
                    >
                        <TableRow>
                            <TableHead className="text-left font-semibold text-base text-black">Funcionário</TableHead>
                            <TableHead className="text-left font-semibold text-base text-black">Email</TableHead>
                            <TableHead className="text-left font-semibold text-base text-black">Telefone</TableHead>
                            <TableHead className="text-left font-semibold text-base text-black">Função</TableHead>
                            <TableHead className="text-left font-semibold text-base text-black">Data de Contratação</TableHead>
                            <TableHead className="text-center font-semibold text-base text-black">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-destructive">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum funcionário encontrado
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="text-left font-medium">{`${employee.name} ${employee.last_name}`}</TableCell>
                                    <TableCell className="text-left">{employee.email}</TableCell>
                                    <TableCell className="text-left">{employee.phone || "-"}</TableCell>
                                    <TableCell className="text-left">
                                        <Badge variant={roleVariants[employee.role.name] || 'default'}>
                                            {employee.role.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        {new Date(employee.hired_at).toLocaleDateString("pt-PT")}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEdit(employee)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDeleteClick(employee.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                    {filteredEmployees.length === 0
                        ? ""
                        : (() => {
                            const start = (page - 1) * pageSize + 1;
                            const end = Math.min(page * pageSize, filteredEmployees.length);
                            return `Mostrando ${start}–${end} de ${filteredEmployees.length}`;
                        })()}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Anterior
                    </Button>
                    <div className="flex items-center px-4 text-sm font-medium">
                        {page} / {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        Próxima
                    </Button>
                </div>
            </div>

            <CreateEmployeeModal
                show={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={refetch}
            />

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader className="space-y-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-center text-xl">
                            Eliminar Funcionário
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-base">
                            Esta ação não pode ser desfeita. Tem a certeza que
                            deseja eliminar permanentemente este funcionário?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row gap-3 justify-center sm:justify-center mt-2">
                        <AlertDialogCancel className="mt-0 flex-1 sm:flex-none px-6 hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="mt-0 flex-1 sm:flex-none px-6 bg-red-600 hover:bg-red-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
