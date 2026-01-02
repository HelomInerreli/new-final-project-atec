import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Search, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { serviceService, type Service } from "../services/serviceService";
import CreateServiceModal from "../components/CreateServiceModal";
import EditServiceModal from "../components/EditServiceModal";
import "../components/inputs.css";

export default function ServicesManagement() {
  const [servicos, setServicos] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 5;

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

  // Reset page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, servicos]);

  const totalPages = Math.max(1, Math.ceil(filteredServicos.length / pageSize));
  const paginatedServicos = filteredServicos.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = (servico: Service) => {
    setEditingServico(servico);
    setEditModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadServices();
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
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">Gestão de Serviços</h1>
        </div>
        <Button variant="destructive" onClick={handleOpenCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="mb-input-wrapper">
        <div style={{ position: 'relative' }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#6b7280',
              pointerEvents: 'none',
              zIndex: 1
            }} 
          />
          <input
            type="text"
            placeholder=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-input"
            style={{ paddingLeft: '46px', borderColor: '#dc3545' }}
            onFocus={(e) => e.target.nextElementSibling?.classList.add('shrunken')}
            onBlur={(e) => {
              if (!e.target.value) {
                e.target.nextElementSibling?.classList.remove('shrunken');
              }
            }}
          />
          <label className={`mb-input-label ${searchTerm ? 'shrunken' : ''}`} style={{ left: '46px' }}>
            Pesquisar por nome ou descrição...
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">A carregar serviços...</p>
        </div>
      ) : (
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
                <TableHead className="font-semibold text-base text-black" style={{ width: "200px", minWidth: "200px" }}>Serviço</TableHead>
                <TableHead className="font-semibold text-base text-black text-left" style={{ width: "300px", minWidth: "300px" }}>Descrição</TableHead>
                <TableHead className="text-right font-semibold text-base text-black" style={{ width: "120px", minWidth: "120px" }}>Preço</TableHead>
                <TableHead className="text-center font-semibold text-base text-black" style={{ width: "100px", minWidth: "100px" }}>Duração</TableHead>
                <TableHead className="text-center font-semibold text-base text-black" style={{ width: "100px", minWidth: "100px" }}>Estado</TableHead>
                <TableHead className="text-right font-semibold text-base text-black" style={{ width: "120px", minWidth: "120px" }}>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServicos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {paginatedServicos.map((servico) => (
                    <TableRow key={servico.id}>
                      <TableCell className="font-medium text-left" style={{ width: "200px", minWidth: "200px" }}>{servico.name}</TableCell>
                      <TableCell className="truncate text-left" style={{ width: "300px", minWidth: "300px", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{servico.description}</TableCell>
                      <TableCell className="text-right font-medium" style={{ width: "120px", minWidth: "120px" }}>
                        {formatPreco(servico.price)}
                      </TableCell>
                      <TableCell className="text-center" style={{ width: "100px", minWidth: "100px" }}>{formatDuracao(servico.duration_minutes ?? null)}</TableCell>
                      <TableCell className="text-center" style={{ width: "100px", minWidth: "100px" }}>
                        <Badge className={servico.is_active ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}>
                          {servico.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" style={{ width: "120px", minWidth: "120px" }}>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEditModal(servico)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteClick(servico.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Fill empty rows to maintain consistent height */}
                  {Array.from({ length: pageSize - paginatedServicos.length }).map((_, idx) => (
                    <TableRow key={`empty-${idx}`} style={{ height: "57px" }}>
                      <TableCell style={{ width: "200px", minWidth: "200px" }}>&nbsp;</TableCell>
                      <TableCell style={{ width: "300px", minWidth: "300px" }}>&nbsp;</TableCell>
                      <TableCell style={{ width: "120px", minWidth: "120px" }}>&nbsp;</TableCell>
                      <TableCell style={{ width: "100px", minWidth: "100px" }}>&nbsp;</TableCell>
                      <TableCell style={{ width: "100px", minWidth: "100px" }}>&nbsp;</TableCell>
                      <TableCell style={{ width: "120px", minWidth: "120px" }}>&nbsp;</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination controls */}
      <div
        className="d-flex justify-content-between align-items-center mt-2 mb-4"
        style={{ flexShrink: 0 }}
      >
        <div className="text-muted">
          {filteredServicos.length === 0
            ? ""
            : (() => {
                const start = (page - 1) * pageSize + 1;
                const end = Math.min(page * pageSize, filteredServicos.length);
                return `Mostrando ${start}–${end} de ${filteredServicos.length}`;
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

      {/* Modals */}
      <CreateServiceModal 
        show={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <EditServiceModal 
        show={editModalOpen}
        service={editingServico}
        onClose={() => {
          setEditModalOpen(false);
          setEditingServico(null);
        }}
        onSuccess={handleModalSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Eliminar Serviço
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Esta ação não pode ser desfeita. Tem a certeza que deseja eliminar permanentemente este serviço?
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
