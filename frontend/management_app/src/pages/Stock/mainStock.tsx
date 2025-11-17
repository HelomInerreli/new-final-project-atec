import { useState } from "react";
import { Button } from "./../../components/ui/button";
import { Input } from "./../../components/ui/input";
import { Label } from "./../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./../../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./../../components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import Badge from "react-bootstrap/Badge";

const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  quantidade: z.number().min(0, "Quantidade deve ser positiva"),
  preco: z.number().min(0, "Preço deve ser positivo"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  fornecedor: z.string().min(1, "Fornecedor é obrigatório"),
});

type Produto = z.infer<typeof produtoSchema> & { id: string };

const categorias = [
  "Peças",
  "Fluidos",
  "Acessórios",
  "Ferramentas",
  "Consumíveis",
];

const initialProdutos: Produto[] = [
  {
    id: "1",
    nome: "Óleo Motor 5W30",
    descricao: "Óleo sintético para motores a gasolina",
    quantidade: 45,
    preco: 35.9,
    categoria: "Fluidos",
    fornecedor: "Castrol",
  },
  {
    id: "2",
    nome: "Filtro de Ar",
    descricao: "Filtro de ar para diversos modelos",
    quantidade: 12,
    preco: 28.5,
    categoria: "Peças",
    fornecedor: "Mann Filter",
  },
  {
    id: "3",
    nome: "Pastilhas de Freio",
    descricao: "Jogo de pastilhas de freio dianteiras",
    quantidade: 8,
    preco: 89.9,
    categoria: "Peças",
    fornecedor: "Bosch",
  },
  {
    id: "4",
    nome: "Líquido Arrefecimento",
    descricao: "Líquido de arrefecimento concentrado",
    quantidade: 25,
    preco: 22.9,
    categoria: "Fluidos",
    fornecedor: "Wurth",
  },
];

export default function Stock() {
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof produtoSchema>>({
    resolver: zodResolver(produtoSchema),
  });

  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch =
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      categoriaFiltro === "todos" || produto.categoria === categoriaFiltro;
    return matchesSearch && matchesCategoria;
  });

  const onSubmit = (data: z.infer<typeof produtoSchema>) => {
    if (editingProduto) {
      setProdutos(
        produtos.map((p) =>
          p.id === editingProduto.id
            ? {
                id: p.id,
                nome: data.nome,
                descricao: data.descricao,
                quantidade: data.quantidade,
                preco: data.preco,
                categoria: data.categoria,
                fornecedor: data.fornecedor,
              }
            : p
        )
      );
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
    } else {
      const novoProduto: Produto = {
        id: Date.now().toString(),
        nome: data.nome,
        descricao: data.descricao,
        quantidade: data.quantidade,
        preco: data.preco,
        categoria: data.categoria,
        fornecedor: data.fornecedor,
      };
      setProdutos([...produtos, novoProduto]);
      toast({
        title: "Produto adicionado",
        description: "O novo produto foi adicionado com sucesso.",
      });
    }
    setDialogOpen(false);
    setEditingProduto(null);
    reset();
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setValue("nome", produto.nome);
    setValue("descricao", produto.descricao);
    setValue("quantidade", produto.quantidade);
    setValue("preco", produto.preco);
    setValue("categoria", produto.categoria);
    setValue("fornecedor", produto.fornecedor);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProdutoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (produtoToDelete) {
      setProdutos(produtos.filter((p) => p.id !== produtoToDelete));
      toast({
        title: "Produto eliminado",
        description: "O produto foi eliminado com sucesso.",
      });
    }
    setDeleteDialogOpen(false);
    setProdutoToDelete(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProduto(null);
    reset();
  };

  const getQuantidadeStatus = (quantidade: number) => {
    if (quantidade === 0) return { bg: "danger" as const, text: "Esgotado" };
    if (quantidade < 10) return { bg: "warning" as const, text: "Baixo" };
    return { bg: "secondary" as const, text: "Normal" };
  };

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h1 fw-bold text-dark">Gestão de Stock</h1>
          <p className="text-muted mt-1">
            Gerencie o inventário de produtos e peças
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open: boolean) => {
            setDialogOpen(open);
            if (!open) {
              setEditingProduto(null);
              reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduto ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
              <DialogDescription>
                {editingProduto
                  ? "Atualize as informações do produto"
                  : "Adicione um novo produto ao stock"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input id="nome" {...register("nome")} />
                  {errors.nome && (
                    <p className="text-sm text-destructive">
                      {errors.nome.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input id="fornecedor" {...register("fornecedor")} />
                  {errors.fornecedor && (
                    <p className="text-sm text-destructive">
                      {errors.fornecedor.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input id="descricao" {...register("descricao")} />
                {errors.descricao && (
                  <p className="text-sm text-destructive">
                    {errors.descricao.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    {...register("quantidade", { valueAsNumber: true })}
                  />
                  {errors.quantidade && (
                    <p className="text-sm text-destructive">
                      {errors.quantidade.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (€)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    {...register("preco", { valueAsNumber: true })}
                  />
                  {errors.preco && (
                    <p className="text-sm text-destructive">
                      {errors.preco.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    onValueChange={(value) => setValue("categoria", value)}
                    defaultValue={editingProduto?.categoria}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoria && (
                    <p className="text-sm text-destructive">
                      {errors.categoria.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduto ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="d-flex gap-3 mb-3">
        <div className="position-relative flex-grow-1">
          <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
          <Input
            placeholder="Pesquisar produtos ou fornecedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-5"
          />
        </div>
        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger style={{ width: 200 }}>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas Categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="table-responsive border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProdutos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProdutos.map((produto) => {
                const status = getQuantidadeStatus(produto.quantidade);
                return (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">
                      {produto.nome}
                    </TableCell>
                    <TableCell>{produto.descricao}</TableCell>
                    <TableCell>{produto.categoria}</TableCell>
                    <TableCell>{produto.fornecedor}</TableCell>
                    <TableCell className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <span>{produto.quantidade}</span>
                        <Badge bg={status.bg}>{status.text}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      €{produto.preco.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(produto)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(produto.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será permanentemente
              eliminado do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
