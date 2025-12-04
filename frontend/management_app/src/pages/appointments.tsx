import { useState, useEffect } from "react";
import { Calendar, Clock, Search, Plus, Phone, Mail, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../hooks/use-toast";
import { appointmentService } from "../services/appointmentService";
import type { Appointment, AppointmentCreate, AppointmentUpdate } from "../services/appointmentService";
import { customerService } from "../services/customerService";
import type { Customer } from "../services/customerService";
import { vehicleService } from "../services/vehicleService";
import type { Vehicle } from "../interfaces/Vehicle";
import { serviceService } from "../services/serviceService";
import type { Service } from "../services/serviceService";
import { statusService } from "../services/statusService";
import type { Status } from "../services/statusService";

interface FormData {
  customer_id: string;
  vehicle_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  description: string;
  estimated_budget: string;
  status_id?: string;
}

const initialFormData: FormData = {
  customer_id: "",
  vehicle_id: "",
  service_id: "",
  appointment_date: "",
  appointment_time: "",
  description: "",
  estimated_budget: "",
  status_id: "",
};

export default function Agendamentos() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]); // Kept for potential future use or if needed by other logic
  const [services, setServices] = useState<Service[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
    loadCustomers();
    loadServices();
    loadStatuses();
  }, []);

  const loadAppointments = async () => {
    try {
      console.log("🔄 Iniciando carregamento de agendamentos...");
      setLoading(true);
      const data = await appointmentService.getAll();
      console.log("✅ Agendamentos carregados:", data);
      setAppointments(data);
    } catch (error) {
      console.error("❌ Erro ao carregar agendamentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      console.log("🔄 Carregando clientes...");
      const data = await customerService.getAll();
      console.log("✅ Clientes carregados:", data);
      setCustomers(data);
    } catch (error) {
      console.error("❌ Erro ao carregar clientes:", error);
    }
  };

  const loadServices = async () => {
    try {
      console.log("🔄 Carregando serviços...");
      const data = await serviceService.getAll();
      console.log("✅ Serviços carregados:", data);
      setServices(data.filter(s => s.is_active));
    } catch (error) {
      console.error("❌ Erro ao carregar serviços:", error);
    }
  };

  const loadStatuses = async () => {
    try {
      console.log("🔄 Carregando status...");
      const data = await statusService.getAll();
      console.log("✅ Status carregados:", data);
      setStatuses(data);
    } catch (error) {
      console.error("❌ Erro ao carregar status:", error);
    }
  };

  const loadVehiclesByCustomer = async (customerId: number) => {
    try {
      const allVehicles = await vehicleService.getAll();
      const filtered = allVehicles.filter(v => v.customer_id === customerId);
      setCustomerVehicles(filtered);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    // Validate date to ensure it's a weekday
    if (id === 'appointment_date' && value) {
      const selectedDate = new Date(value + 'T00:00:00');
      const dayOfWeek = selectedDate.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        toast({
          title: "Data Inválida",
          description: "Por favor, selecione um dia de semana (segunda a sexta-feira).",
          variant: "destructive"
        });
        return;
      }
    }

    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // When customer changes, load their vehicles
    if (field === "customer_id" && value) {
      loadVehiclesByCustomer(parseInt(value));
      setFormData(prev => ({ ...prev, vehicle_id: "" }));
    }
  };

  const translateStatus = (statusName?: string): string => {
    if (!statusName) return "Pendente";
    const lower = statusName.toLowerCase();
    if (lower.includes("finalizad") || lower.includes("finalized")) return "Finalizado";
    if (lower.includes("aguarda") || lower.includes("waiting")) return "Aguarda Pagamento";
    return "Pendente";
  };

  const getStatusColor = (statusName?: string) => {
    if (!statusName) return "bg-yellow-100 text-yellow-800"; // Default to Pendente color
    const lower = statusName.toLowerCase();
    if (lower.includes("finalizad") || lower.includes("finalized")) return "bg-green-100 text-green-800";
    if (lower.includes("aguarda") || lower.includes("waiting")) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800"; // Pendente
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const customerName = appointment.customer?.name || "";
    const vehicleInfo = appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}` : "";
    const serviceName = appointment.service?.name || "";
    const statusName = appointment.status?.name || "";
    const translatedStatus = translateStatus(statusName).toLowerCase();

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === "todos" ||
      translatedStatus.includes(statusFilter.toLowerCase()) ||
      statusName.toLowerCase().includes(statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (appointment: Appointment | null) => {
    if (appointment) {
      setEditingId(appointment.id);
      const appointmentDateTime = new Date(appointment.appointment_date);
      const dateStr = appointmentDateTime.toISOString().split('T')[0];
      const timeStr = appointmentDateTime.toTimeString().slice(0, 5);

      setFormData({
        customer_id: appointment.customer_id?.toString() || "",
        vehicle_id: appointment.vehicle_id?.toString() || "",
        service_id: appointment.service_id?.toString() || "",
        appointment_date: dateStr,
        appointment_time: timeStr,
        description: appointment.description,
        estimated_budget: appointment.estimated_budget.toString(),
        status_id: appointment.status_id?.toString() || "",
      });

      if (appointment.customer_id) {
        loadVehiclesByCustomer(appointment.customer_id);
      }
    } else {
      setEditingId(null);
      setFormData(initialFormData);
      setCustomerVehicles([]);
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.vehicle_id || !formData.service_id || !formData.appointment_date || !formData.appointment_time) {
      toast({
        title: "Erro de Validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Combine date and time into ISO string
      const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`);

      if (editingId) {
        // Update existing appointment
        const updateData: AppointmentUpdate = {
          appointment_date: appointmentDateTime.toISOString(),
          description: formData.description,
          estimated_budget: parseFloat(formData.estimated_budget) || 0,
          status_id: formData.status_id ? parseInt(formData.status_id) : undefined,
        };

        await appointmentService.update(editingId, updateData);
        toast({ title: "Sucesso!", description: "Agendamento atualizado." });
      } else {
        // Create new appointment
        const createData: AppointmentCreate = {
          customer_id: parseInt(formData.customer_id),
          vehicle_id: parseInt(formData.vehicle_id),
          service_id: parseInt(formData.service_id),
          appointment_date: appointmentDateTime.toISOString(),
          description: formData.description,
          estimated_budget: parseFloat(formData.estimated_budget) || 0,
          actual_budget: 0,
        };

        await appointmentService.create(createData);
        toast({ title: "Sucesso!", description: "Novo agendamento criado." });
      }

      await loadAppointments();
      setIsFormOpen(false);
      setEditingId(null);
      setFormData(initialFormData);
      setCustomerVehicles([]);
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await appointmentService.delete(id);
      await loadAppointments();
      toast({
        title: "Eliminado",
        description: "O agendamento foi eliminado com sucesso.",
        variant: "destructive"
      });
    } catch (error) {
      console.error("Erro ao eliminar agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos de serviços da oficina</p>
        </div>
        <Button variant="destructive" className="gap-2" onClick={() => handleOpenDialog(null)}>
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
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="aguarda pagamento">Aguarda Pagamento</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {filteredAppointments.map((appointment) => {
          const appointmentDate = new Date(appointment.appointment_date);
          const dateStr = appointmentDate.toLocaleDateString('pt-BR');
          const timeStr = appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const vehicleInfo = appointment.vehicle
            ? `${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}`
            : 'N/A';

          return (
            <Card key={appointment.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="space-y-2">
                  <Badge className={getStatusColor(appointment.status?.name)} variant="outline">
                    {translateStatus(appointment.status?.name)}
                  </Badge>
                  <CardTitle className="text-lg">{appointment.customer?.name || 'N/A'}</CardTitle>
                  <CardDescription className="mt-1">{vehicleInfo}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{dateStr}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{timeStr}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{appointment.customer?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{appointment.customer?.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="font-medium text-sm">{appointment.service?.name || 'N/A'}</p>
                  {appointment.description && <p className="text-xs text-muted-foreground mt-1">{appointment.description}</p>}
                  {appointment.estimated_budget > 0 && (
                    <p className="text-xs font-semibold mt-1">Orçamento: €{appointment.estimated_budget.toFixed(2)}</p>
                  )}
                </div>
              </CardContent>

              <div className="flex gap-2 p-4 pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-transparent hover:bg-white"
                  onClick={() => handleOpenDialog(appointment)}
                >
                  <Edit className="h-4 w-4 text-red-600" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-transparent hover:bg-white"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
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
                      <AlertDialogCancel className="hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(appointment.id)}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Mensagem de Nenhum Resultado */}
      {filteredAppointments.length === 0 && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Calendar className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3><p className="text-sm text-muted-foreground">Tente ajustar os filtros ou criar um novo agendamento</p></CardContent></Card>
      )}

      {/* Dialog para Criar/Editar */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
              <DialogDescription>{editingId ? "Altere os dados do agendamento abaixo." : "Preencha os dados para criar um novo agendamento."}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_id">Cliente *</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => handleSelectChange("customer_id", value)}
                  disabled={!!editingId}
                >
                  <SelectTrigger id="customer_id">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="vehicle_id">Veículo *</Label>
                <Select
                  value={formData.vehicle_id}
                  onValueChange={(value) => handleSelectChange("vehicle_id", value)}
                  disabled={!formData.customer_id || !!editingId}
                >
                  <SelectTrigger id="vehicle_id">
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.brand} {vehicle.model} - {vehicle.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service_id">Serviço *</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => handleSelectChange("service_id", value)}
                  disabled={!!editingId}
                >
                  <SelectTrigger id="service_id">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} - €{service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="appointment_date">Data *</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:sepia [&::-webkit-calendar-picker-indicator]:saturate-[500%] [&::-webkit-calendar-picker-indicator]:hue-rotate-[-15deg] [&::-webkit-calendar-picker-indicator]:brightness-90"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="appointment_time">Hora *</Label>
                  <Select
                    value={formData.appointment_time}
                    onValueChange={(value) => handleSelectChange("appointment_time", value)}
                  >
                    <SelectTrigger id="appointment_time">
                      <SelectValue placeholder="Selecione a hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "09:00", "09:15", "09:30", "09:45",
                        "10:00", "10:15", "10:30", "10:45",
                        "11:00", "11:15", "11:30", "11:45",
                        "12:00", "12:15", "12:30", "12:45",
                        "13:00", "13:15", "13:30", "13:45",
                        "14:00", "14:15", "14:30", "14:45",
                        "15:00", "15:15", "15:30", "15:45",
                        "16:00", "16:15", "16:30", "16:45",
                        "17:00"
                      ].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estimated_budget">Orçamento Estimado (€)</Label>
                <Input
                  id="estimated_budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimated_budget}
                  onChange={handleInputChange}
                />
              </div>

              {editingId && (
                <div className="grid gap-2">
                  <Label htmlFor="status_id">Status</Label>
                  <Select
                    value={formData.status_id}
                    onValueChange={(value) => handleSelectChange("status_id", value)}
                  >
                    <SelectTrigger id="status_id">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {translateStatus(status.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Observações ou detalhes adicionais"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                  setFormData(initialFormData);
                  setCustomerVehicles([]);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading ? "A processar..." : (editingId ? "Salvar Alterações" : "Criar Agendamento")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
