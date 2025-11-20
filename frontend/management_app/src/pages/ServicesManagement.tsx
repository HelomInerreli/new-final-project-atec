import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "../hooks/use-toast";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../components/ui/table";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../components/ui/dialog";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "../components/ui/alert-dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../components/ui/form";
import { Textarea } from "../components/ui/textarea";
import { serviceService, type Service } from "../services/serviceService";

const servicoSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Preço deve ser maior que 0"),
  duration_minutes: z.number().min(1, "Duração deve ser maior que 0"),
});

export default function ServicesManagement() {
  const [servicos, setServicos] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState<number | null>(null);

  const form = useForm<z.infer<typeof servicoSchema>>({
    resolver: zodResolver(servicoSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration_minutes: 30,
    },
  });

  // Load services from API
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      console.log("🔄 Tentando carregar serviços...");
      setLoading(true);
      const data = await serviceService.getAll();
      console.log("✅ Serviços carregados:", data);
      setServicos(data);
    } catch (error) {
      console.error("❌ Erro ao carregar serviços:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços.",
        variant: "destructive",
      });
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServicos = servicos.filter((servico) => {
    const matchesSearch = 
      servico.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (servico.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesSearch;
  });

  const handleOpenDialog = (servico?: Service) => {
    if (servico) {
      setEditingServico(servico);
      form.reset({
        name: servico.name,
        description: servico.description || "",
        price: servico.price,
        duration_minutes: servico.duration_minutes || 30,
      });
    } else {
      setEditingServico(null);
      form.reset({
        name: "",
        description: "",
        price: 0,
        duration_minutes: 30,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (values: z.infer<typeof servicoSchema>) => {
    console.log("🚀 handleSubmit chamado com valores:", values);
    try {
      if (editingServico) {
        console.log("✏️ Atualizando serviço ID:", editingServico.id);
        await serviceService.update(editingServico.id, values);
        toast({
          title: "Serviço atualizado",
          description: "O serviço foi atualizado com sucesso.",
        });
      } else {
        console.log("➕ Criando novo serviço");
        await serviceService.create(values);
        toast({
          title: "Serviço criado",
          description: "O serviço foi criado com sucesso.",
        });
      }
      setDialogOpen(false);
      form.reset();
      loadServices(); // Reload the list
    } catch (error) {
      console.error("❌ Erro no handleSubmit:", error);
      toast({
        title: "Erro",
        description: editingServico ? "Não foi possível atualizar o serviço." : "Não foi possível criar o serviço.",
        variant: "destructive",
      });
      console.error("Error saving service:", error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setServicoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (servicoToDelete) {
      try {
        await serviceService.delete(servicoToDelete);
        toast({
          title: "Serviço eliminado",
          description: "O serviço foi eliminado com sucesso.",
        });
        loadServices(); // Reload the list
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível eliminar o serviço.",
          variant: "destructive",
        });
        console.error("Error deleting service:", error);
      }
    }
    setDeleteDialogOpen(false);
    setServicoToDelete(null);
  };

  const formatPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(preco);
  };

  const formatDuracao = (minutos: number | null) => {
    if (!minutos) return "N/A";
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Serviços</h1>
          <p className="text-muted-foreground">Gerir serviços e preços da oficina</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">A carregar serviços...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-center">Duração</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServicos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredServicos.map((servico) => (
                  <TableRow key={servico.id}>
                    <TableCell className="font-medium">{servico.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{servico.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPreco(servico.price)}
                    </TableCell>
                    <TableCell className="text-center">{formatDuracao(servico.duration_minutes)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={servico.is_active ? "default" : "secondary"}>
                        {servico.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenDialog(servico)}
                          className="bg-transparent hover:bg-white"
                        >
                          <Edit className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteClick(servico.id)}
                          className="bg-transparent hover:bg-white"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingServico ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            <DialogDescription>
              {editingServico ? "Edite as informações do serviço abaixo." : "Preencha as informações do novo serviço."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={(e) => {
              console.log("📝 Form onSubmit triggered");
              console.log("Form values:", form.getValues());
              console.log("Form errors:", form.formState.errors);
              form.handleSubmit(handleSubmit)(e);
            }} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Serviço</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Mudança de Óleo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva o serviço..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingServico ? "Guardar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. O serviço será permanentemente eliminado.
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
