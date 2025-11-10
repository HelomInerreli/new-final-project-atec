import { useState } from "react";
import { Calendar, Clock, Search, Plus, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
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
  {
    id: "AG001",
    cliente: "João Silva",
    telefone: "(11) 98765-4321",
    email: "joao.silva@email.com",
    veiculo: "Honda Civic - ABC1234",
    data: "2025-11-02",
    hora: "09:00",
    servico: "Revisão 10.000 km",
    status: "confirmado",
    observacoes: "Cliente solicitou troca de óleo sintético"
  },
  {
    id: "AG002",
    cliente: "Maria Santos",
    telefone: "(11) 91234-5678",
    email: "maria.santos@email.com",
    veiculo: "Toyota Corolla - XYZ5678",
    data: "2025-11-02",
    hora: "14:00",
    servico: "Troca de pastilhas de freio",
    status: "pendente"
  },
  {
    id: "AG003",
    cliente: "Carlos Oliveira",
    telefone: "(11) 99876-5432",
    email: "carlos.oliveira@email.com",
    veiculo: "Ford Focus - DEF9012",
    data: "2025-11-03",
    hora: "10:30",
    servico: "Alinhamento e balanceamento",
    status: "confirmado"
  },
  {
    id: "AG004",
    cliente: "Ana Paula",
    telefone: "(11) 93456-7890",
    email: "ana.paula@email.com",
    veiculo: "Volkswagen Golf - GHI3456",
    data: "2025-11-03",
    hora: "16:00",
    servico: "Diagnóstico de motor",
    status: "cancelado",
    observacoes: "Cliente cancelou por motivos pessoais"
  },
  {
    id: "AG005",
    cliente: "Pedro Costa",
    telefone: "(11) 94567-8901",
    email: "pedro.costa@email.com",
    veiculo: "Chevrolet Onix - JKL7890",
    data: "2025-11-04",
    hora: "11:00",
    servico: "Troca de óleo e filtros",
    status: "confirmado"
  }
];

export default function Agendamentos() {
  const [agendamentos] = useState<Agendamento[]>(mockAgendamentos);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "pendente":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "cancelado":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted";
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

  const handleNovoAgendamento = () => {
    toast({
      title: "Agendamento criado",
      description: "O novo agendamento foi criado com sucesso.",
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos de serviços da oficina
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo agendamento
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input id="cliente" placeholder="Nome do cliente" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 99999-9999" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="veiculo">Veículo</Label>
                <Input id="veiculo" placeholder="Marca Modelo - Placa" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="data">Data</Label>
                  <Input id="data" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input id="hora" type="time" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="servico">Serviço</Label>
                <Input id="servico" placeholder="Tipo de serviço" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" placeholder="Observações adicionais (opcional)" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleNovoAgendamento}>Criar Agendamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, veículo ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgendamentos.map((agendamento) => (
          <Card key={agendamento.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{agendamento.cliente}</CardTitle>
                  <CardDescription className="mt-1">
                    {agendamento.veiculo}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(agendamento.status)} variant="outline">
                  {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(agendamento.data).toLocaleDateString('pt-BR')}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{agendamento.hora}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{agendamento.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{agendamento.email}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <p className="font-medium text-sm">{agendamento.servico}</p>
                {agendamento.observacoes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {agendamento.observacoes}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgendamentos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros ou criar um novo agendamento
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
