import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "../hooks/use-toast";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "../components/ui/table";
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,} from "../components/ui/dialog";
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,} from "../components/ui/alert-dialog";
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage,
} from "../components/ui/form";
import { Textarea } from "../components/ui/textarea";

type Servico = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number; // em minutos
  categoria: string;
};

const servicoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  preco: z.number().min(0.01, "Preço deve ser maior que 0"),
  duracao: z.number().min(1, "Duração deve ser maior que 0"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
});

const initialServicos: Servico[] = [
  {
    id: "1",
    nome: "Mudança de Óleo",
    descricao: "Troca de óleo do motor e filtro",
    preco: 45.00,
    duracao: 30,
    categoria: "Manutenção",
  },
  {
    id: "2",
    nome: "Alinhamento e Balanceamento",
    descricao: "Alinhamento de direção e balanceamento de rodas",
    preco: 65.00,
    duracao: 60,
    categoria: "Suspensão",
  },
  {
    id: "3",
    nome: "Revisão Completa",
    descricao: "Revisão geral do veículo com 50 pontos de verificação",
    preco: 150.00,
    duracao: 120,
    categoria: "Manutenção",
  },
  {
    id: "4",
    nome: "Troca de Pastilhas de Travão",
    descricao: "Substituição de pastilhas dianteiras ou traseiras",
    preco: 85.00,
    duracao: 90,
    categoria: "Travões",
  },
  {
    id: "5",
    nome: "Diagnóstico Eletrónico",
    descricao: "Leitura de códigos de erro com equipamento especializado",
    preco: 35.00,
    duracao: 30,
    categoria: "Eletrónica",
  },
  {
    id: "6",
    nome: "Substituição de Bateria",
    descricao: "Troca e teste de bateria do veículo",
    preco: 120.00,
    duracao: 20,
    categoria: "Eletrónica",
  },
];

export default function ServicesManagement() {
  const [servicos, setServicos] = useState<Servico[]>(initialServicos);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState<string | null>(null);

  const form = useForm<z.infer<typeof servicoSchema>>({
    resolver: zodResolver(servicoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      preco: 0,
      duracao: 30,
      categoria: "Manutenção",
    },
  });

  const categorias = ["Todos", ...new Set(servicos.map(s => s.categoria))];

  const filteredServicos = servicos.filter((servico) => {
    const matchesSearch = 
      servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter === "Todos" || servico.categoria === categoriaFilter;
    
    return matchesSearch && matchesCategoria;
  });

  const handleOpenDialog = (servico?: Servico) => {
    if (servico) {
      setEditingServico(servico);
      form.reset({
        nome: servico.nome,
        descricao: servico.descricao,
        preco: servico.preco,
        duracao: servico.duracao,
        categoria: servico.categoria,
      });
    } else {
      setEditingServico(null);
      form.reset({
        nome: "",
        descricao: "",
        preco: 0,
        duracao: 30,
        categoria: "Manutenção",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (values: z.infer<typeof servicoSchema>) => {
    if (editingServico) {
      setServicos(servicos.map(s => 
        s.id === editingServico.id 
          ? { 
              id: s.id,
              nome: values.nome,
              descricao: values.descricao,
              preco: values.preco,
              duracao: values.duracao,
              categoria: values.categoria,
            }
          : s
      ));
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
    } else {
      const newServico: Servico = {
        id: Date.now().toString(),
        nome: values.nome,
        descricao: values.descricao,
        preco: values.preco,
        duracao: values.duracao,
        categoria: values.categoria,
      };
      setServicos([...servicos, newServico]);
      toast({
        title: "Serviço criado",
        description: "O serviço foi criado com sucesso.",
      });
    }
    setDialogOpen(false);
    form.reset();
  };

  const handleDeleteClick = (id: string) => {
    setServicoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (servicoToDelete) {
      setServicos(servicos.filter(s => s.id !== servicoToDelete));
      toast({
        title: "Serviço eliminado",
        description: "O serviço foi eliminado com sucesso.",
      });
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

  const formatDuracao = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  return (
    <div className="space-y-6">
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
        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-center">Duração</TableHead>
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
                  <TableCell className="font-medium">{servico.nome}</TableCell>
                  <TableCell className="max-w-xs truncate">{servico.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{servico.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPreco(servico.preco)}
                  </TableCell>
                  <TableCell className="text-center">{formatDuracao(servico.duracao)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenDialog(servico)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteClick(servico.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingServico ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
            <DialogDescription>
              {editingServico 
                ? "Edite as informações do serviço abaixo." 
                : "Preencha as informações do novo serviço."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
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
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o serviço..." 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preco"
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
                  name="duracao"
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
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Manutenção" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
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
