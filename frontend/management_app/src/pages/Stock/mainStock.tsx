import { useEffect, useState } from "react";
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
import http from "../../api/http";
import type { ProductCategory, StockStatus } from "../../interfaces/Product";

const categorias: ProductCategory[] = [
  "Peças",
  "Acessórios",
  "Fluidos",
  "Consumíveis",
  "Ferramentas",
  "Equipamentos",
  "Outros",
];

const statusMap: Record<StockStatus, { bg: string; text: string }> = {
  Normal: { bg: "secondary", text: "Normal" },
  Baixo: { bg: "warning", text: "Baixo" },
  Crítico: { bg: "danger", text: "Crítico" },
  Esgotado: { bg: "danger", text: "Esgotado" },
};

const produtoSchema = z.object({
  partNumber: z.string().min(1, "Código da peça é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  quantidade: z.number().min(0, "Quantidade deve ser positiva"),
  reserveQuantity: z
    .number()
    .min(0, "Quantidade reservada deve ser positiva")
    .optional(),
  preco: z.number().min(0, "Preço deve ser positivo"),
  costValue: z.number().min(0, "Custo deve ser positivo"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  fornecedor: z.string().min(1, "Fornecedor é obrigatório"),
  minimumStock: z.number().min(0, "Estoque mínimo deve ser positivo"),
});

type Produto = z.infer<typeof produtoSchema> & { id: string };

const initialProdutos: Produto[] = [];

export default function Stock() {
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 5;

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

  // reset page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoriaFiltro, produtos]);

  const totalPages = Math.max(1, Math.ceil(filteredProdutos.length / pageSize));
  const paginatedProdutos = filteredProdutos.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const onSubmit = (data: z.infer<typeof produtoSchema>) => {
    (async () => {
      try {
        if (editingProduto) {
          const payload = {
            partNumber: data.partNumber,
            name: data.nome,
            description: data.descricao,
            category: data.categoria,
            brand: data.fornecedor,
            quantity: data.quantidade,
            reserveQuantity: data.reserveQuantity || 0,
            costValue: data.costValue,
            saleValue: data.preco,
            minimumStock: data.minimumStock,
          };
          const idNum = Number(editingProduto.id);
          await http.put(`/products/${idNum}`, payload);
          setProdutos(
            produtos.map((p) =>
              p.id === editingProduto.id
                ? {
                    ...p,
                    partNumber: data.partNumber,
                    nome: data.nome,
                    descricao: data.descricao,
                    quantidade: data.quantidade,
                    reserveQuantity: data.reserveQuantity || 0,
                    preco: data.preco,
                    costValue: data.costValue,
                    categoria: data.categoria,
                    fornecedor: data.fornecedor,
                    minimumStock: data.minimumStock,
                  }
                : p
            )
          );
          toast({
            title: "Produto atualizado",
            description: "O produto foi atualizado com sucesso.",
          });
        } else {
          const payload = {
            partNumber: data.partNumber,
            name: data.nome,
            description: data.descricao,
            category: data.categoria,
            brand: data.fornecedor,
            quantity: data.quantidade,
            reserveQuantity: data.reserveQuantity || 0,
            costValue: data.costValue,
            saleValue: data.preco,
            minimumStock: data.minimumStock,
          };
          const res = await http.post("/products/", payload);
          const created = res.data;
          const novoProduto: Produto = {
            id: String(created.id),
            partNumber: created.partNumber || `PN-${created.id}`,
            nome: created.name,
            descricao: created.description || "",
            quantidade: created.quantity || 0,
            reserveQuantity: created.reserveQuantity ?? 0,
            preco: created.saleValue ?? created.sale_value ?? 0,
            costValue: created.costValue ?? created.cost_value ?? 0,
            categoria: created.category || "",
            fornecedor: created.brand || "",
            minimumStock: created.minimumStock ?? 1,
          };
          setProdutos((prev) => [...prev, novoProduto]);
          toast({
            title: "Produto adicionado",
            description: "O novo produto foi adicionado com sucesso.",
          });
        }
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Erro",
          description: err?.message || "Falha na operação",
        });
      } finally {
        setDialogOpen(false);
        setEditingProduto(null);
        reset();
      }
    })();
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setValue("partNumber", produto.partNumber);
    setValue("nome", produto.nome);
    setValue("descricao", produto.descricao);
    setValue("quantidade", produto.quantidade);
    setValue("reserveQuantity", produto.reserveQuantity || 0);
    setValue("preco", produto.preco);
    setValue("costValue", produto.costValue);
    setValue("categoria", produto.categoria);
    setValue("fornecedor", produto.fornecedor);
    setValue("minimumStock", produto.minimumStock);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProdutoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    (async () => {
      try {
        if (produtoToDelete) {
          const idNum = Number(produtoToDelete);
          await http.delete(`/products/${idNum}`);
          setProdutos((prev) => prev.filter((p) => p.id !== produtoToDelete));
          toast({
            title: "Produto eliminado",
            description: "O produto foi eliminado com sucesso.",
          });
        }
      } catch (err) {
        console.error(err);
        toast({ title: "Erro", description: "Falha ao eliminar produto." });
      } finally {
        setDeleteDialogOpen(false);
        setProdutoToDelete(null);
      }
    })();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProduto(null);
    reset();
  };

  const getQuantidadeStatus = (
    quantidade: number,
    reserveQuantity: number = 0,
    minimumStock: number = 1
  ): { bg: string; text: string } => {
    // Calcula a quantidade disponível (total - reservada)
    const quantidadeDisponivel = quantidade - reserveQuantity;

    // Se não há produto, é esgotado
    if (quantidadeDisponivel <= 0) {
      return statusMap.Esgotado;
    }

    // Calcula o threshold: mínimo + 1/3 do mínimo
    const threshold = minimumStock + minimumStock / 3;

    // Se está abaixo do mínimo, é crítico
    if (quantidadeDisponivel < minimumStock) {
      return statusMap.Crítico;
    }

    // Se está entre mínimo e mínimo + 1/3, é baixo
    if (quantidadeDisponivel <= threshold) {
      return statusMap.Baixo;
    }

    // Caso contrário, é normal
    return statusMap.Normal;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await http.get("/products/");
        const items = Array.isArray(res.data) ? res.data : [];
        const mapped: Produto[] = items.map((p: any) => ({
          id: String(p.id),
          partNumber: p.partNumber || `PN-${p.id}`,
          nome: p.name,
          descricao: p.description || "",
          quantidade: p.quantity ?? 0,
          reserveQuantity: p.reserveQuantity ?? 0,
          preco: p.saleValue ?? p.sale_value ?? 0,
          costValue: p.costValue ?? p.cost_value ?? 0,
          categoria: p.category || "",
          fornecedor: p.brand || "",
          minimumStock: p.minimumStock ?? p.minimum_stock ?? 1,
        }));
        setProdutos(mapped);
      } catch (err) {
        console.error("Failed to load products", err);
        toast({ title: "Erro", description: "Falha ao carregar produtos" });
      }
    };
    fetchProducts();
  }, []);

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
                  <Label htmlFor="partNumber">Código da Peça</Label>
                  <Input id="partNumber" {...register("partNumber")} />
                  {errors.partNumber && (
                    <p className="text-sm text-destructive">
                      {errors.partNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input id="nome" {...register("nome")} />
                  {errors.nome && (
                    <p className="text-sm text-destructive">
                      {errors.nome.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="reserveQuantity">Quantidade Reservada</Label>
                  <Input
                    id="reserveQuantity"
                    type="number"
                    {...register("reserveQuantity", { valueAsNumber: true })}
                  />
                  {errors.reserveQuantity && (
                    <p className="text-sm text-destructive">
                      {errors.reserveQuantity.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumStock">Estoque Mínimo</Label>
                  <Input
                    id="minimumStock"
                    type="number"
                    {...register("minimumStock", { valueAsNumber: true })}
                  />
                  {errors.minimumStock && (
                    <p className="text-sm text-destructive">
                      {errors.minimumStock.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costValue">Custo (€)</Label>
                  <Input
                    id="costValue"
                    type="number"
                    step="0.01"
                    {...register("costValue", { valueAsNumber: true })}
                  />
                  {errors.costValue && (
                    <p className="text-sm text-destructive">
                      {errors.costValue.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco">Preço de Venda (€)</Label>
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

      <div className="d-flex gap-3 mb-3 pb-3" style={{ flexShrink: 0 }}>
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
              paginatedProdutos.map((produto) => {
                const status = getQuantidadeStatus(
                  produto.quantidade,
                  produto.reserveQuantity,
                  produto.minimumStock
                );
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

      {/* Pagination controls */}
      <div
        className="d-flex justify-content-between align-items-center mt-2 mb-4"
        style={{ flexShrink: 0 }}
      >
        <div className="text-muted">
          {filteredProdutos.length === 0
            ? ""
            : (() => {
                const start = (page - 1) * pageSize + 1;
                const end = Math.min(page * pageSize, filteredProdutos.length);
                return `Mostrando ${start}–${end} de ${filteredProdutos.length}`;
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
