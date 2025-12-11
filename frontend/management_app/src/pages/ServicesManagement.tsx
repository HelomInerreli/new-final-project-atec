import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "../hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../components/ui/form";
import { serviceService, type Service } from "../services/serviceService";
import "../components/inputs.css";

const servicoSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Preço deve ser maior que 0"),
  duration_minutes: z.number().min(1, "Duração deve ser maior que 0"),
  is_active: z.boolean().optional(),
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
      price: undefined,
      duration_minutes: 30,
      is_active: true,
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
        is_active: servico.is_active,
      });
    } else {
      setEditingServico(null);
      form.reset({
        name: "",
        description: "",
        price: undefined,
        duration_minutes: 30,
        is_active: true,
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
        <Button variant="destructive" onClick={() => handleOpenDialog()}>
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
            style={{ paddingLeft: '46px' }}
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
        <div className="rounded-md border-2 border-red-600">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-base text-black">Serviço</TableHead>
                <TableHead className="font-semibold text-base text-black">Descrição</TableHead>
                <TableHead className="text-right font-semibold text-base text-black">Preço</TableHead>
                <TableHead className="text-center font-semibold text-base text-black">Duração</TableHead>
                <TableHead className="text-center font-semibold text-base text-black">Estado</TableHead>
                <TableHead className="text-right font-semibold text-base text-black">Ações</TableHead>
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
                    <TableCell className="font-medium text-left">{servico.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{servico.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPreco(servico.price)}
                    </TableCell>
                    <TableCell className="text-center">{formatDuracao(servico.duration_minutes ?? null)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={servico.is_active ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}>
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
                    <FormControl>
                      <div className="mb-input-wrapper">
                        <input
                          type="text"
                          placeholder=""
                          className="mb-input"
                          {...field}
                          onFocus={(e) => e.target.nextElementSibling?.classList.add('shrunken')}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.nextElementSibling?.classList.remove('shrunken');
                            }
                          }}
                        />
                        <label className={`mb-input-label ${field.value ? 'shrunken' : ''}`}>
                          Nome do Serviço
                        </label>
                      </div>
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
                    <FormControl>
                      <div className="mb-input-wrapper">
                        <textarea
                          placeholder=""
                          className="mb-input textarea"
                          rows={3}
                          {...field}
                          onFocus={(e) => e.target.nextElementSibling?.classList.add('shrunken')}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.nextElementSibling?.classList.remove('shrunken');
                            }
                          }}
                        />
                        <label className={`mb-input-label ${field.value ? 'shrunken' : ''}`}>
                          Descrição
                        </label>
                      </div>
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
                      <FormControl>
                        <div className="mb-input-wrapper">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder=""
                            className="mb-input"
                            {...field}
                            value={field.value === undefined || field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                            onFocus={(e) => e.target.nextElementSibling?.classList.add('shrunken')}
                            onBlur={(e) => {
                              if (!e.target.value) {
                                e.target.nextElementSibling?.classList.remove('shrunken');
                              }
                            }}
                          />
                          <label className={`mb-input-label ${field.value ? 'shrunken' : ''}`}>
                            Preço (€)
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => {
                    const [isOpen, setIsOpen] = useState(false);
                    const [isFocused, setIsFocused] = useState(false);
                    const menuRef = useRef<HTMLDivElement>(null);
                    const hasValue = field.value !== undefined && field.value !== null;
                    const durations = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240];
                    
                    const formatDuration = (minutes: number) => {
                      return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60 > 0 ? `${minutes % 60}min` : ''}`.trim();
                    };

                    useEffect(() => {
                      const handleClickOutside = (event: MouseEvent) => {
                        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                          setIsOpen(false);
                        }
                      };
                      if (isOpen) {
                        document.addEventListener('mousedown', handleClickOutside);
                      }
                      return () => document.removeEventListener('mousedown', handleClickOutside);
                    }, [isOpen]);

                    return (
                      <FormItem>
                        <FormControl>
                          <div className="mb-input-wrapper" ref={menuRef} style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className={`mb-input select ${!hasValue && !isFocused ? 'placeholder' : ''}`}
                              onClick={() => setIsOpen(!isOpen)}
                              onFocus={() => setIsFocused(true)}
                              onBlur={() => setIsFocused(false)}
                              style={{ textAlign: 'left', cursor: 'pointer' }}
                            >
                              {hasValue ? formatDuration(field.value) : ''}
                            </button>
                            <label className={`mb-input-label ${hasValue || isFocused ? 'shrunken' : ''}`}>
                              Duração (min)
                            </label>
                            <span className="mb-select-caret">▼</span>
                            
                            {isOpen && (
                              <ul className="mb-select-menu" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {durations.map((minutes) => (
                                  <li
                                    key={minutes}
                                    className={`mb-select-item ${field.value === minutes ? 'selected' : ''}`}
                                    onClick={() => {
                                      field.onChange(minutes);
                                      setIsOpen(false);
                                    }}
                                  >
                                    {formatDuration(minutes)}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              
              {editingServico && (
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <label className="text-sm font-medium">Estado:</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => field.onChange(true)}
                              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                field.value 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              Ativo
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange(false)}
                              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                !field.value 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              Inativo
                            </button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive">
                  {editingServico ? "Guardar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
