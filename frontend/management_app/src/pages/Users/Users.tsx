import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
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
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useEmployees } from "../../hooks/useEmployees";
import { useRoles } from "../../hooks/useRoles";
import type { Employee } from "../../interfaces/Employee";
import { Skeleton } from "../../components/ui/skeleton";

// Schema de validação para o formulário de funcionário
const employeeSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    last_name: z.string().min(1, "Apelido é obrigatório"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(1, "Telefone é obrigatório"),
    address: z.string().min(1, "Morada é obrigatória"),
    date_of_birth: z.string().min(1, "Data de nascimento é obrigatória"),
    salary: z.coerce.number().positive("Salário deve ser um número positivo"),
    hired_at: z.string().min(1, "Data de contratação é obrigatória"),
    role_id: z.coerce.number().min(1, "Função é obrigatória"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const roleVariants: { [key: string]: "destructive" | "default" | "secondary" | "outline" } = {
    Gestor: "destructive",
    Mecanico: "default",
    Eletricista: "secondary",
    Borracheiro: "outline",
} as const;

export default function Users() {
    const navigate = useNavigate();
    const { employees, loading, error, addEmployee, updateEmployee, removeEmployee } = useEmployees();
    const { roles, loading: rolesLoading } = useRoles();

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(null);
    const [page, setPage] = useState<number>(1);
    const pageSize = 5;

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            role_id: 0, // Ensure a default value to avoid uncontrolled component warnings
        }
    });

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

    const onSubmit = async (data: EmployeeFormData) => {
        const promise = () => editingEmployee
            ? updateEmployee(editingEmployee.id, data)
            : addEmployee(data);

        toast.promise(promise(), {
            loading: `A ${editingEmployee ? 'atualizar' : 'criar'} funcionário...`,
            success: `Funcionário ${editingEmployee ? 'atualizado' : 'criado'} com sucesso!`,
            error: `Erro ao ${editingEmployee ? 'atualizar' : 'criar'} funcionário.`,
        });

        handleDialogClose();
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        // Formata as datas para o formato YYYY-MM-DD para os inputs type="date"
        const defaultValues = {
            ...employee,
            date_of_birth: new Date(employee.date_of_birth).toISOString().split('T')[0],
            hired_at: new Date(employee.hired_at).toISOString().split('T')[0],
        };
        reset(defaultValues);
        setIsDialogOpen(true);
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

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        reset();
        setEditingEmployee(null);
    };

    return (
        <div
            className="d-flex flex-column"
            style={{
                height: "100%",
                backgroundColor: "transparent",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-light"
                style={{ flexShrink: 0 }}
            >
                <div>
                    <h1 className="h1 fw-bold text-dark">Funcionários</h1>
                    <p className="text-muted mt-1">
                        Gerencie os funcionários do sistema
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-red-500" onClick={() => navigate('/ferias')}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Férias
                    </Button>
                    <Button variant="outline" className="border-red-500" onClick={() => navigate('/folgas')}>
                        <Umbrella className="h-4 w-4 mr-2" />
                        Folgas
                    </Button>
                    <Button variant="destructive" className="border-red-500" onClick={() => { setEditingEmployee(null); reset(); setIsDialogOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Funcionário
                    </Button>
                </div>
            </div>

            <div className="d-flex gap-3 mb-3 pb-3" style={{ flexShrink: 0 }}>
                <div className="position-relative flex-grow-1">
                    <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                    <Input
                        placeholder="Pesquisar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ps-5"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger style={{ width: 200 }}>
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
                className="table-responsive border rounded flex-grow-1"
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
                            <TableHead>Funcionário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Data de Contratação</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
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
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    Nenhum funcionário encontrado
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">{`${employee.name} ${employee.last_name}`}</TableCell>
                                    <TableCell>{employee.email}</TableCell>
                                    <TableCell>{employee.phone || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={roleVariants[employee.role.name] || 'default'}>
                                            {employee.role.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(employee.hired_at).toLocaleDateString("pt-PT")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
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
            <div
                className="d-flex justify-content-between align-items-center mt-2 mb-4"
                style={{ flexShrink: 0 }}
            >
                <div className="text-muted">
                    {filteredEmployees.length === 0
                        ? ""
                        : (() => {
                            const start = (page - 1) * pageSize + 1;
                            const end = Math.min(page * pageSize, filteredEmployees.length);
                            return `Mostrando ${start}–${end} de ${filteredEmployees.length}`;
                        })()}
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Anterior
                    </Button>
                    <div className="align-self-center">
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

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose} >
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingEmployee
                                ? "Edite as informações do funcionário"
                                : "Preencha os dados do novo funcionário"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" {...register("name")} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Apelido</Label>
                            <Input id="last_name" {...register("last_name")} />
                            {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register("email")} />
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" {...register("phone")} />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salary">Salário (€)</Label>
                            <Input id="salary" type="number" {...register("salary")} />
                            {errors.salary && <p className="text-sm text-destructive">{errors.salary.message}</p>}
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="address">Morada</Label>
                            <Input id="address" {...register("address")} />
                            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                            <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
                            {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hired_at">Data de Contratação</Label>
                            <Input id="hired_at" type="date" {...register("hired_at")} />
                            {errors.hired_at && <p className="text-sm text-destructive">{errors.hired_at.message}</p>}
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="role_id">Função</Label>
                            <Controller
                                name="role_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        value={(field.value as number) > 0 ? String(field.value) : ""}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma função" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rolesLoading ? (
                                                <SelectItem value="loading" disabled>A carregar...</SelectItem>
                                            ) : (
                                                roles.map(role => (
                                                    <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.role_id && <p className="text-sm text-destructive">{errors.role_id.message}</p>}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDialogClose}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {editingEmployee ? "Atualizar" : "Criar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser revertida. O funcionário será
                            marcado como inativo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
