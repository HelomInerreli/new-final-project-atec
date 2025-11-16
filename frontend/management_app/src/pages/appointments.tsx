import { useState } from "react";
import { Calendar, Clock, Search, Plus, Phone, Mail, Trash2, Edit, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../hooks/use-toast";

interface Agendamento {
  id: string;
  cliente: string;
  telefone: string;
  email: string;
  veiculo: string;
  data: string;
  hora: string;
  servico: string;
  status: "confirmado" | "pendente" | "cancelado";
  observacoes?: string;
}

const mockAgendamentos: Agendamento[] = [
  { id: "AG001", cliente: "João Silva", telefone: "(11) 98765-4321", email: "joao.silva@email.com", veiculo: "Honda Civic - ABC1234", data: "2025-11-02", hora: "09:00", servico: "Revisão 10.000 km", status: "confirmado", observacoes: "Cliente solicitou troca de óleo sintético" },
  { id: "AG002", cliente: "Maria Santos", telefone: "(11) 91234-5678", email: "maria.santos@email.com", veiculo: "Toyota Corolla - XYZ5678", data: "2025-11-02", hora: "14:00", servico: "Troca de pastilhas de freio", status: "pendente" },
  { id: "AG003", cliente: "Carlos Oliveira", telefone: "(11) 99876-5432", email: "carlos.oliveira@email.com", veiculo: "Ford Focus - DEF9012", data: "2025-11-03", hora: "10:30", servico: "Alinhamento e balanceamento", status: "confirmado" },
  { id: "AG004", cliente: "Ana Paula", telefone: "(11) 93456-7890", email: "ana.paula@email.com", veiculo: "Volkswagen Golf - GHI3456", data: "2025-11-03", hora: "16:00", servico: "Diagnóstico de motor", status: "cancelado", observacoes: "Cliente cancelou por motivos pessoais" },
  { id: "AG005", cliente: "Pedro Costa", telefone: "(11) 94567-8901", email: "pedro.costa@email.com", veiculo: "Chevrolet Onix - JKL7890", data: "2025-11-04", hora: "11:00", servico: "Troca de óleo e filtros", status: "confirmado" }
];

const initialFormData: Omit<Agendamento, 'id' | 'status'> = {
  cliente: "", telefone: "", email: "", veiculo: "", data: "", hora: "", servico: "", observacoes: "",
};

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockAgendamentos);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (value: Agendamento['status']) => {
    setFormData(prev => ({ ...prev, status: value } as Agendamento));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado": return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "pendente": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "cancelado": return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default: return "bg-muted";
    }
  };

  const filteredAgendamentos = agendamentos.filter((agendamento) => {
    const matchesSearch =
      agendamento.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || agendamento.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (agendamento: Agendamento | null) => {
    if (agendamento) {
      setEditingId(agendamento.id);
      setFormData(agendamento);
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.cliente || !formData.data || !formData.hora || !formData.servico) {
      toast({ title: "Erro de Validação", description: "Preencha os campos obrigatórios.", variant: "destructive" });
      return;
    }

    if (editingId) {
      // Lógica de Edição
      setAgendamentos(prev => prev.map(ag => ag.id === editingId ? { ...ag, ...formData, id: editingId } : ag));
      toast({ title: "Sucesso!", description: "Agendamento atualizado." });
    } else {
      // Lógica de Criação
      const novoAgendamento: Agendamento = { id: `AG${Date.now()}`, ...formData, status: "pendente" };
      setAgendamentos(prev => [novoAgendamento, ...prev]);
      toast({ title: "Sucesso!", description: "Novo agendamento criado." });
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setAgendamentos(prev => prev.filter(ag => ag.id !== id));
    toast({ title: "Eliminado", description: "O agendamento foi eliminado com sucesso.", variant: "destructive" });
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos de serviços da oficina</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenDialog(null)}>
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente, veículo ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {filteredAgendamentos.map((agendamento) => (
          <Card key={agendamento.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="space-y-2">
                <Badge className={getStatusColor(agendamento.status)} variant="outline">
                  {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                </Badge>
                <CardTitle className="text-lg">{agendamento.cliente}</CardTitle>
                <CardDescription className="mt-1">{agendamento.veiculo}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span>{agendamento.data ? new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</span><Clock className="h-4 w-4 ml-2" /><span>{agendamento.hora}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /><span>{agendamento.telefone}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /><span className="truncate">{agendamento.email}</span></div>
              </div>
              <div className="pt-3 border-t">
                <p className="font-medium text-sm">{agendamento.servico}</p>
                {agendamento.observacoes && <p className="text-xs text-muted-foreground mt-1">{agendamento.observacoes}</p>}
              </div>
            </CardContent>
            
            <div className="flex gap-2 p-4 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1.5 min-w-0 !outline-none !ring-0 hover:bg-gray-100 hover:text-black active:bg-gray-200" 
                onClick={() => handleOpenDialog(agendamento)}
              >
                <Edit className="h-3.5 w-3.5" />
                Editar
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-[1.2] gap-1.5 min-w-0 !outline-none !ring-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isto irá eliminar permanentemente o agendamento.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(agendamento.id)}>Continuar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>

      {/* Mensagem de Nenhum Resultado */}
      {filteredAgendamentos.length === 0 && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Calendar className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3><p className="text-sm text-muted-foreground">Tente ajustar os filtros ou criar um novo agendamento</p></CardContent></Card>
      )}

      {/* Dialog para Criar/Editar */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <button
            onClick={() => setIsFormOpen(false)}
            className="absolute right-4 top-4 rounded-sm p-1 text-red-500 border border-red-500 hover:text-red-600 hover:border-red-600 focus:outline-none transition-colors bg-transparent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
              <DialogDescription>{editingId ? "Altere os dados do agendamento abaixo." : "Preencha os dados para criar um novo agendamento."}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="cliente">Cliente</Label><Input id="cliente" value={formData.cliente} onChange={handleInputChange} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="telefone">Telefone</Label><Input id="telefone" value={formData.telefone} onChange={handleInputChange} /></div>
                <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} /></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="veiculo">Veículo</Label><Input id="veiculo" value={formData.veiculo} onChange={handleInputChange} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="data">Data</Label><Input id="data" type="date" value={formData.data} onChange={handleInputChange} required /></div>
                <div className="grid gap-2"><Label htmlFor="hora">Hora</Label><Input id="hora" type="time" value={formData.hora} onChange={handleInputChange} required /></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="servico">Serviço</Label><Input id="servico" value={formData.servico} onChange={handleInputChange} required /></div>
              {editingId && (
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={(formData as Agendamento).status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2"><Label htmlFor="observacoes">Observações</Label><Textarea id="observacoes" value={formData.observacoes} onChange={handleInputChange} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="!outline-none !ring-0 hover:bg-gray-100 hover:text-black active:bg-gray-200" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingId ? "Salvar Alterações" : "Criar Agendamento"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
