import { useEffect, useState } from "react";
import { Button } from "./../../components/ui/button";
import { Input } from "./../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./../../components/ui/table";
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
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import Badge from "react-bootstrap/Badge";
import http from "../../api/http";
import type { ProductCategory, StockStatus } from "../../interfaces/Product";
import CreateProductModal from "../../components/CreateProductModal";

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

interface Produto {
  id: string;
  partNumber: string;
  nome: string;
  descricao: string;
  quantidade: number;
  reserveQuantity?: number;
  preco: number;
  costValue: number;
  categoria: string;
  fornecedor: string;
  minimumStock: number;
}

export default function Stock() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 5;

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
    fetchProducts();
  }, []);

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">Gestão de Stock</h1>
        </div>
        <Button variant="destructive" onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
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
              Pesquisar produtos ou fornecedores...
            </label>
          </div>
        </div>
        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="w-full sm:w-[200px] border-2 border-red-600 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0" style={{ height: "56px" }}>
            <SelectValue placeholder="Filtrar por categoria" />
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
              <TableHead className="text-left font-semibold text-base text-black">Produto</TableHead>
              <TableHead className="text-left font-semibold text-base text-black">Descrição</TableHead>
              <TableHead className="text-left font-semibold text-base text-black">Categoria</TableHead>
              <TableHead className="text-left font-semibold text-base text-black">Fornecedor</TableHead>
              <TableHead className="text-right font-semibold text-base text-black">Quantidade</TableHead>
              <TableHead className="text-right font-semibold text-base text-black">Preço</TableHead>
              <TableHead className="text-center font-semibold text-base text-black">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProdutos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
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
                    <TableCell className="text-left font-medium">
                      {produto.nome}
                    </TableCell>
                    <TableCell className="text-left">{produto.descricao}</TableCell>
                    <TableCell className="text-left">{produto.categoria}</TableCell>
                    <TableCell className="text-left">{produto.fornecedor}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{produto.quantidade}</span>
                        <Badge bg={status.bg}>{status.text}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      €{produto.preco.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
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
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          {filteredProdutos.length === 0
            ? ""
            : (() => {
                const start = (page - 1) * pageSize + 1;
                const end = Math.min(page * pageSize, filteredProdutos.length);
                return `Mostrando ${start}–${end} de ${filteredProdutos.length}`;
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Eliminar Produto
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Esta ação não pode ser desfeita. Tem a certeza que
              deseja eliminar permanentemente este produto?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 justify-center sm:justify-center mt-2">
            <AlertDialogCancel className="mt-0 flex-1 sm:flex-none px-6 hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="mt-0 flex-1 sm:flex-none px-6 bg-red-600 hover:bg-red-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Product Modal */}
      <CreateProductModal
        show={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchProducts();
        }}
      />
    </div>
  );
}
