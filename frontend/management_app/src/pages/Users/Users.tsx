import { useState } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../../hooks/use-toast";

const usuarioSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    telefone: z.string().optional(),
    role: z.enum(["admin", "moderator", "user"]),
});

type Usuario = z.infer<typeof usuarioSchema> & {
    id: string;
    dataCriacao: string;
};

const initialUsuarios: Usuario[] = [
    {
        id: "1",
        nome: "João Silva",
        email: "joao.silva@mecatec.com",
        telefone: "912345678",
        role: "admin",
        dataCriacao: "2024-01-15",
    },
    {
        id: "2",
        nome: "Maria Santos",
        email: "maria.santos@mecatec.com",
        telefone: "923456789",
        role: "moderator",
        dataCriacao: "2024-02-20",
    },
    {
        id: "3",
        nome: "Pedro Costa",
        email: "pedro.costa@mecatec.com",
        telefone: "934567890",
        role: "user",
        dataCriacao: "2024-03-10",
    },
];

const roleLabels = {
    admin: "Administrador",
    moderator: "Moderador",
    user: "Utilizador",
};

const roleVariants = {
    admin: "destructive",
    moderator: "default",
    user: "secondary",
} as const;

export default function Usuarios() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
    const [deletingUsuarioId, setDeletingUsuarioId] = useState<string | null>(null);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<z.infer<typeof usuarioSchema>>({
        resolver: zodResolver(usuarioSchema),
    });

    const selectedRole = watch("role");

    const filteredUsuarios = usuarios.filter((usuario) => {
        const matchesSearch =
            usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || usuario.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const onSubmit = (data: z.infer<typeof usuarioSchema>) => {
        if (editingUsuario) {
            setUsuarios(
                usuarios.map((u) =>
                    u.id === editingUsuario.id
                        ? {
                            id: u.id,
                            nome: data.nome,
                            email: data.email,
                            telefone: data.telefone || "",
                            role: data.role,
                            dataCriacao: u.dataCriacao,
                        }
                        : u
                )
            );
            toast({
                title: "Utilizador atualizado",
                description: "O utilizador foi atualizado com sucesso.",
            });
        } else {
            const novoUsuario: Usuario = {
                id: Date.now().toString(),
                nome: data.nome,
                email: data.email,
                telefone: data.telefone || "",
                role: data.role,
                dataCriacao: new Date().toISOString().split("T")[0],
            };
            setUsuarios([...usuarios, novoUsuario]);
            toast({
                title: "Utilizador criado",
                description: "O utilizador foi criado com sucesso.",
            });
        }
        setIsDialogOpen(false);
        reset();
        setEditingUsuario(null);
    };

    const handleEdit = (usuario: Usuario) => {
        setEditingUsuario(usuario);
        setValue("nome", usuario.nome);
        setValue("email", usuario.email);
        setValue("telefone", usuario.telefone);
        setValue("role", usuario.role);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeletingUsuarioId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (deletingUsuarioId) {
            setUsuarios(usuarios.filter((u) => u.id !== deletingUsuarioId));
            toast({
                title: "Utilizador eliminado",
                description: "O utilizador foi eliminado com sucesso.",
            });
        }
        setIsDeleteDialogOpen(false);
        setDeletingUsuarioId(null);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        reset();
        setEditingUsuario(null);
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
                    <h1 className="h1 fw-bold text-dark">Utilizadores</h1>
                    <p className="text-muted mt-1">
                        Gerencie os utilizadores do sistema
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
                    <Button variant="destructive" className="border-red-500" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Utilizador
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
                        <SelectItem value="all">Todas as funções</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="moderator">Moderador</SelectItem>
                        <SelectItem value="user">Utilizador</SelectItem>
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
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Data de Criação</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsuarios.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center text-muted-foreground"
                                >
                                    Nenhum utilizador encontrado
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsuarios.map((usuario) => (
                                <TableRow key={usuario.id}>
                                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                                    <TableCell>{usuario.email}</TableCell>
                                    <TableCell>{usuario.telefone || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={roleVariants[usuario.role]}>
                                            {roleLabels[usuario.role]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(usuario.dataCriacao).toLocaleDateString("pt-PT")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEdit(usuario)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDeleteClick(usuario.id)}
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

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingUsuario ? "Editar Utilizador" : "Novo Utilizador"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUsuario
                                ? "Edite as informações do utilizador"
                                : "Preencha os dados do novo utilizador"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input id="nome" {...register("nome")} />
                            {errors.nome && (
                                <p className="text-sm text-destructive">
                                    {errors.nome.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register("email")} />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input id="telefone" {...register("telefone")} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Função</Label>
                            <Select
                                value={selectedRole}
                                onValueChange={(value) => setValue("role", value as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma função" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="moderator">Moderador</SelectItem>
                                    <SelectItem value="user">Utilizador</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-destructive">
                                    {errors.role.message}
                                </p>
                            )}
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
                                {editingUsuario ? "Atualizar" : "Criar"}
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
                            Esta ação não pode ser revertida. O utilizador será permanentemente
                            eliminado.
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
