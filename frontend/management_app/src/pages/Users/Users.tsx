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
                    <Button variant="destructive" className="border-red-500" onClick={() => { setEditingEmployee(null); reset(); setIsDialogOpen(true); }}>
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
                            style={{ paddingLeft: "46px" }}
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

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-[625px] p-0 gap-0">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogHeader className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 rounded-t-lg m-0 !flex-row items-center justify-between !space-y-0">
                            <DialogTitle className="text-white text-2xl font-bold">
                                {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
                            </DialogTitle>
                            <button 
                                type="button"
                                onClick={handleDialogClose}
                                className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all focus:outline-none flex-shrink-0"
                                style={{ outline: "none", boxShadow: "none" }}
                                aria-label="Fechar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4 px-6">
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
                        </div>
                        <DialogFooter className="px-6 pb-6">
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
