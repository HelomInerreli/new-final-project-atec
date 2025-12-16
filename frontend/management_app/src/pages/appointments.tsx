import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  Search,
  Plus,
  Phone,
  Mail,
  Trash2,
  Edit,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../hooks/use-toast";
import { appointmentService } from "../services/appointmentService";
import type {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
} from "../services/appointmentService";
import { customerService } from "../services/customerService";
import type { Customer } from "../services/customerService";
import { vehicleService } from "../services/vehicleService";
import type { Vehicle } from "../services/vehicleService";
import { serviceService } from "../services/serviceService";
import type { Service } from "../services/serviceService";
import { statusService } from "../services/statusService";
import type { Status } from "../services/statusService";
import "../components/inputs.css";

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

  // Dropdown states
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Refs for dropdowns
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAppointments();
    loadCustomers();
    loadServices();
    loadStatuses();
  }, []);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setCustomerDropdownOpen(false);
      }
      if (
        vehicleDropdownRef.current &&
        !vehicleDropdownRef.current.contains(event.target as Node)
      ) {
        setVehicleDropdownOpen(false);
      }
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target as Node)
      ) {
        setServiceDropdownOpen(false);
      }
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target as Node)
      ) {
        setTimeDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadAppointments = async () => {
    try {
      console.log("🔄 Iniciando carregamento de agendamentos...");
      setLoading(true);
      const data = await appointmentService.getAll();
      console.log("✅ Agendamentos carregados:", data);
      console.log("📊 Total de appointments:", data.length);
      if (data.length > 0) {
        console.log("📋 Exemplo do primeiro appointment:", data[0]);
        console.log("  - Customer:", data[0].customer);
        console.log("  - Vehicle:", data[0].vehicle);
        console.log("  - Service:", data[0].service);
        console.log("  - Status:", data[0].status);
      }
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
      setServices(data.filter((s) => s.is_active));
    } catch (error) {
      console.error("❌ Erro ao carregar serviços:", error);
    }
  };

  const loadStatuses = async () => {
    try {
      console.log("🔄 Carregando status...");
      const data = await statusService.getAll();
      console.log("✅ Status carregados:", data);
      // Filtrar para mostrar apenas: Pendente, Concluído e Aguardando Pagamento
      const allowedStatuses = data.filter(s => {
        const lower = s.name.toLowerCase();
        return lower.includes("pendente") || 
               lower.includes("concluído") || 
               lower.includes("concluido") ||
               lower.includes("aguardando pagamento") ||
               lower.includes("aguarda");
      });
      setStatuses(allowedStatuses);
    } catch (error) {
      console.error("❌ Erro ao carregar status:", error);
    }
  };

  const loadVehiclesByCustomer = async (customerId: number) => {
    try {
      console.log("🔄 Carregando veículos para o cliente:", customerId);
      const vehicles = await vehicleService.getByCustomerId(customerId);
      console.log("✅ Veículos carregados:", vehicles);
      setCustomerVehicles(vehicles);
      if (vehicles.length === 0) {
        toast({
          title: "Aviso",
          description: "Este cliente não tem veículos cadastrados.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("❌ Erro ao carregar veículos:", error);
      setCustomerVehicles([]);
      toast({
        title: "Erro",
        description: "Erro ao carregar veículos do cliente.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    // Validate date to ensure it's a weekday
    if (id === "appointment_date" && value) {
      const selectedDate = new Date(value + "T00:00:00");
      const dayOfWeek = selectedDate.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        toast({
          title: "Data Inválida",
          description:
            "Por favor, selecione um dia de semana (segunda a sexta-feira).",
          variant: "destructive",
        });
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    console.log("🔄 handleSelectChange:", field, value);
    // When customer changes, load their vehicles and reset vehicle_id
    if (field === "customer_id" && value) {
      console.log(
        "👤 Cliente selecionado, ID:",
        value,
        "carregando veículos..."
      );
      setFormData((prev) => {
        const newData = { ...prev, [field]: value, vehicle_id: "" };
        console.log("📝 Novo formData:", newData);
        return newData;
      });
      const customerId = parseInt(value);
      console.log("🔢 Chamando loadVehiclesByCustomer com:", customerId);
      loadVehiclesByCustomer(customerId);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const translateStatus = (statusName?: string): string => {
    if (!statusName) return "Pendente";
    const lower = statusName.toLowerCase();
    if (lower.includes("finalizad") || lower.includes("finalized"))
      return "Finalizado";
    if (lower.includes("aguarda") || lower.includes("waiting"))
      return "Aguarda Pagamento";
    return "Pendente";
  };

  const getStatusColor = (statusName?: string) => {
    if (!statusName) return "bg-yellow-100 text-yellow-800"; // Default to Pendente color
    const lower = statusName.toLowerCase();
    if (lower.includes("finalizad") || lower.includes("finalized"))
      return "bg-green-100 text-green-800";
    if (lower.includes("aguarda") || lower.includes("waiting"))
      return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800"; // Pendente
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const customerName = appointment.customer?.name || "";
    const vehicleInfo = appointment.vehicle
      ? `${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}`
      : "";
    const serviceName = appointment.service?.name || "";
    const statusName = appointment.status?.name || "";
    const translatedStatus = translateStatus(statusName).toLowerCase();

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.id.toString().includes(searchTerm);

    const matchesStatus =
      statusFilter === "todos" ||
      translatedStatus.includes(statusFilter.toLowerCase()) ||
      statusName.toLowerCase().includes(statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Debug log
  console.log("🔍 Filtro de appointments:");
  console.log("  - Total appointments:", appointments.length);
  console.log("  - Filtered appointments:", filteredAppointments.length);
  console.log("  - Search term:", searchTerm);
  console.log("  - Status filter:", statusFilter);

  const handleOpenDialog = (appointment: Appointment | null) => {
    if (appointment) {
      setEditingId(appointment.id);
      const appointmentDateTime = new Date(appointment.appointment_date);
      const dateStr = appointmentDateTime.toISOString().split("T")[0];
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

    if (
      !formData.customer_id ||
      !formData.vehicle_id ||
      !formData.service_id ||
      !formData.appointment_date ||
      !formData.appointment_time
    ) {
      toast({
        title: "Erro de Validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Combine date and time into ISO string
      const appointmentDateTime = new Date(
        `${formData.appointment_date}T${formData.appointment_time}`
      );

      if (editingId) {
        // Update existing appointment
        const updateData: AppointmentUpdate = {
          vehicle_id: parseInt(formData.vehicle_id),
          service_id: parseInt(formData.service_id),
          appointment_date: appointmentDateTime.toISOString(),
          description: formData.description,
          estimated_budget: parseFloat(formData.estimated_budget) || 0,
          status_id: formData.status_id
            ? parseInt(formData.status_id)
            : undefined,
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
        variant: "destructive",
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">Gestão de Agendamentos</h1>
          <p className="text-lg text-gray-600 mt-2 font-medium">Gerencie os agendamentos de serviços da oficina</p>
        </div>
        <Button
          variant="destructive"
          className="gap-2"
          onClick={() => handleOpenDialog(null)}
        >
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
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
              Buscar por cliente, veículo ou ID...
            </label>
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
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
          const dateStr = appointmentDate.toLocaleDateString("pt-BR");
          const timeStr = appointmentDate.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const vehicleInfo = appointment.vehicle
            ? `${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}`
            : "N/A";

          return (
            <Card
              key={appointment.id}
              className="flex flex-col hover:shadow-lg transition-shadow border-2 border-red-600"
            >
              <CardHeader>
                <div className="space-y-2">
                  <Badge
                    className={getStatusColor(appointment.status?.name)}
                    variant="outline"
                  >
                    {translateStatus(appointment.status?.name)}
                  </Badge>
                  <CardTitle className="text-lg">
                    {appointment.customer?.name || "N/A"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {vehicleInfo}
                  </CardDescription>
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
                    <span>{appointment.customer?.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">
                      {appointment.customer?.email || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="font-medium text-sm">
                    {appointment.service?.name || "N/A"}
                  </p>
                  {appointment.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {appointment.description}
                    </p>
                  )}
                  {appointment.estimated_budget > 0 && (
                    <p className="text-xs font-semibold mt-1">
                      Orçamento: €{appointment.estimated_budget.toFixed(2)}
                    </p>
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
                  <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader className="space-y-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <AlertDialogTitle className="text-center text-xl">
                        Eliminar Agendamento
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-center text-base">
                        Esta ação não pode ser desfeita. Tem a certeza que
                        deseja eliminar permanentemente este agendamento?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row gap-3 justify-center sm:justify-center mt-2">
                      <AlertDialogCancel className="mt-0 flex-1 sm:flex-none px-6 hover:bg-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(appointment.id)}
                        className="mt-0 flex-1 sm:flex-none px-6 bg-red-600 hover:bg-red-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                      >
                        Eliminar
                      </AlertDialogAction>
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum agendamento encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros ou criar um novo agendamento
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog para Criar/Editar */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Altere os dados do agendamento abaixo."
                  : "Preencha os dados para criar um novo agendamento."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <div className="mb-input-wrapper">
                  {(() => {
                    const [isOpen, setIsOpen] = useState(false);
                    const [isFocused, setIsFocused] = useState(false);
                    const menuRef = useRef<HTMLDivElement>(null);
                    const hasValue = formData.customer_id !== "";
                    const selectedCustomer = customers.find(
                      (c) => c.id.toString() === formData.customer_id
                    );

                    useEffect(() => {
                      const handleClickOutside = (event: MouseEvent) => {
                        if (
                          menuRef.current &&
                          !menuRef.current.contains(event.target as Node)
                        ) {
                          setIsOpen(false);
                        }
                      };
                      if (isOpen) {
                        document.addEventListener(
                          "mousedown",
                          handleClickOutside
                        );
                      }
                      return () =>
                        document.removeEventListener(
                          "mousedown",
                          handleClickOutside
                        );
                    }, [isOpen]);

                    return (
                      <div ref={menuRef} style={{ position: "relative" }}>
                        <button
                          type="button"
                          className={`mb-input select ${
                            !hasValue && !isFocused ? "placeholder" : ""
                          }`}
                          onClick={() => !editingId && setIsOpen(!isOpen)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          disabled={!!editingId}
                          style={{
                            textAlign: "left",
                            cursor: editingId ? "not-allowed" : "pointer",
                          }}
                        >
                          {selectedCustomer ? selectedCustomer.name : ""}
                        </button>
                        <label
                          className={`mb-input-label ${
                            hasValue || isFocused ? "shrunken" : ""
                          }`}
                        >
                          Cliente *
                        </label>
                        <span className="mb-select-caret">▼</span>

                        {isOpen && !editingId && (
                          <ul
                            className="mb-select-menu"
                            style={{ maxHeight: "250px", overflowY: "auto" }}
                          >
                            {customers.map((customer) => (
                              <li
                                key={customer.id}
                                className={`mb-select-item ${
                                  formData.customer_id ===
                                  customer.id.toString()
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() => {
                                  handleSelectChange(
                                    "customer_id",
                                    customer.id.toString()
                                  );
                                  setIsOpen(false);
                                }}
                              >
                                {customer.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="mb-input-wrapper">
                  <div
                    ref={vehicleDropdownRef}
                    style={{ position: "relative" }}
                  >
                    <button
                      type="button"
                      className={`mb-input select ${
                        !formData.vehicle_id ? "placeholder" : ""
                      }`}
                      onClick={() => {
                        if (!formData.customer_id) return;
                        setVehicleDropdownOpen(!vehicleDropdownOpen);
                      }}
                      disabled={!formData.customer_id}
                      style={{
                        textAlign: "left",
                        cursor: !formData.customer_id
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      {(() => {
                        const selectedVehicle = customerVehicles.find(
                          (v) => v.id.toString() === formData.vehicle_id
                        );
                        return selectedVehicle
                          ? `${selectedVehicle.brand} ${selectedVehicle.model} - ${selectedVehicle.plate}`
                          : "";
                      })()}
                    </button>
                    <label
                      className={`mb-input-label ${
                        formData.vehicle_id || vehicleDropdownOpen
                          ? "shrunken"
                          : ""
                      }`}
                    >
                      Veículo *
                    </label>
                    <span className="mb-select-caret">▼</span>

                    {vehicleDropdownOpen && formData.customer_id && (
                      <ul
                        className="mb-select-menu"
                        style={{ maxHeight: "250px", overflowY: "auto" }}
                      >
                        {customerVehicles.length === 0 ? (
                          <li
                            className="mb-select-item"
                            style={{ cursor: "default", opacity: 0.6 }}
                          >
                            Nenhum veículo encontrado
                          </li>
                        ) : (
                          customerVehicles.map((vehicle) => (
                            <li
                              key={vehicle.id}
                              className={`mb-select-item ${
                                formData.vehicle_id === vehicle.id.toString()
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => {
                                handleSelectChange(
                                  "vehicle_id",
                                  vehicle.id.toString()
                                );
                                setVehicleDropdownOpen(false);
                              }}
                            >
                              {vehicle.brand} {vehicle.model} - {vehicle.plate}
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="mb-input-wrapper">
                  {(() => {
                    const [isOpen, setIsOpen] = useState(false);
                    const [isFocused, setIsFocused] = useState(false);
                    const menuRef = useRef<HTMLDivElement>(null);
                    const hasValue = formData.service_id !== "";
                    const selectedService = services.find(
                      (s) => s.id.toString() === formData.service_id
                    );

                    useEffect(() => {
                      const handleClickOutside = (event: MouseEvent) => {
                        if (
                          menuRef.current &&
                          !menuRef.current.contains(event.target as Node)
                        ) {
                          setIsOpen(false);
                        }
                      };
                      if (isOpen) {
                        document.addEventListener(
                          "mousedown",
                          handleClickOutside
                        );
                      }
                      return () =>
                        document.removeEventListener(
                          "mousedown",
                          handleClickOutside
                        );
                    }, [isOpen]);

                    return (
                      <div ref={menuRef} style={{ position: "relative" }}>
                        <button
                          type="button"
                          className={`mb-input select ${
                            !hasValue && !isFocused ? "placeholder" : ""
                          }`}
                          onClick={() => setIsOpen(!isOpen)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          style={{ textAlign: "left", cursor: "pointer" }}
                        >
                          {selectedService
                            ? `${
                                selectedService.name
                              } - €${selectedService.price.toFixed(2)}`
                            : ""}
                        </button>
                        <label
                          className={`mb-input-label ${
                            hasValue || isFocused ? "shrunken" : ""
                          }`}
                        >
                          Serviço *
                        </label>
                        <span className="mb-select-caret">▼</span>

                        {isOpen && (
                          <ul
                            className="mb-select-menu"
                            style={{ maxHeight: "250px", overflowY: "auto" }}
                          >
                            {services.map((service) => (
                              <li
                                key={service.id}
                                className={`mb-select-item ${
                                  formData.service_id === service.id.toString()
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() => {
                                  handleSelectChange(
                                    "service_id",
                                    service.id.toString()
                                  );
                                  setIsOpen(false);
                                }}
                              >
                                {service.name} - €{service.price.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div
                    className="mb-input-wrapper"
                    style={{ position: "relative" }}
                  >
                    <input
                      id="appointment_date"
                      type="date"
                      className={`mb-input date-input ${
                        formData.appointment_date ? "has-value" : ""
                      }`}
                      value={formData.appointment_date}
                      onChange={(e) => {
                        const selectedDate = new Date(
                          e.target.value + "T00:00:00"
                        );
                        const dayOfWeek = selectedDate.getDay();
                        if (dayOfWeek === 0 || dayOfWeek === 6) {
                          e.target.value = "";
                          toast({
                            title: "Data Inválida",
                            description:
                              "Por favor, selecione um dia útil (Segunda a Sexta-feira).",
                            variant: "destructive",
                          });
                          return;
                        }
                        handleInputChange(e);
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      onFocus={(e) =>
                        e.target.nextElementSibling?.classList.add("shrunken")
                      }
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.nextElementSibling?.classList.remove(
                            "shrunken"
                          );
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent manual typing of weekend dates
                        const input = e.currentTarget;
                        setTimeout(() => {
                          if (input.value) {
                            const date = new Date(input.value + "T00:00:00");
                            const day = date.getDay();
                            if (day === 0 || day === 6) {
                              input.value = "";
                              setFormData((prev) => ({
                                ...prev,
                                appointment_date: "",
                              }));
                            }
                          }
                        }, 0);
                      }}
                    />
                    <label
                      className={`mb-input-label ${
                        formData.appointment_date ? "shrunken" : ""
                      }`}
                    >
                      Data *
                    </label>
                    <Calendar
                      size={20}
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6b7280",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        document
                          .getElementById("appointment_date")
                          ?.showPicker()
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    {(() => {
                      const [isOpen, setIsOpen] = useState(false);
                      const [isFocused, setIsFocused] = useState(false);
                      const menuRef = useRef<HTMLDivElement>(null);
                      const hasValue = formData.appointment_time !== "";
                      const times = [
                        "09:00",
                        "09:15",
                        "09:30",
                        "09:45",
                        "10:00",
                        "10:15",
                        "10:30",
                        "10:45",
                        "11:00",
                        "11:15",
                        "11:30",
                        "11:45",
                        "12:00",
                        "12:15",
                        "12:30",
                        "12:45",
                        "13:00",
                        "13:15",
                        "13:30",
                        "13:45",
                        "14:00",
                        "14:15",
                        "14:30",
                        "14:45",
                        "15:00",
                        "15:15",
                        "15:30",
                        "15:45",
                        "16:00",
                        "16:15",
                        "16:30",
                        "16:45",
                        "17:00",
                      ];

                      useEffect(() => {
                        const handleClickOutside = (event: MouseEvent) => {
                          if (
                            menuRef.current &&
                            !menuRef.current.contains(event.target as Node)
                          ) {
                            setIsOpen(false);
                          }
                        };
                        if (isOpen) {
                          document.addEventListener(
                            "mousedown",
                            handleClickOutside
                          );
                        }
                        return () =>
                          document.removeEventListener(
                            "mousedown",
                            handleClickOutside
                          );
                      }, [isOpen]);

                      return (
                        <div ref={menuRef} style={{ position: "relative" }}>
                          <button
                            type="button"
                            className={`mb-input select ${
                              !hasValue && !isFocused ? "placeholder" : ""
                            }`}
                            onClick={() => setIsOpen(!isOpen)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            style={{ textAlign: "left", cursor: "pointer" }}
                          >
                            {formData.appointment_time || ""}
                          </button>
                          <label
                            className={`mb-input-label ${
                              hasValue || isFocused ? "shrunken" : ""
                            }`}
                          >
                            Hora *
                          </label>
                          <span className="mb-select-caret">▼</span>

                          {isOpen && (
                            <ul
                              className="mb-select-menu"
                              style={{ maxHeight: "250px", overflowY: "auto" }}
                            >
                              {times.map((time) => (
                                <li
                                  key={time}
                                  className={`mb-select-item ${
                                    formData.appointment_time === time
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    handleSelectChange(
                                      "appointment_time",
                                      time
                                    );
                                    setIsOpen(false);
                                  }}
                                >
                                  {time}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="mb-input-wrapper">
                  <input
                    id="estimated_budget"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder=""
                    className="mb-input"
                    value={formData.estimated_budget}
                    onChange={handleInputChange}
                    onFocus={(e) =>
                      e.target.nextElementSibling?.classList.add("shrunken")
                    }
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.nextElementSibling?.classList.remove(
                          "shrunken"
                        );
                      }
                    }}
                  />
                  <label
                    className={`mb-input-label ${
                      formData.estimated_budget ? "shrunken" : ""
                    }`}
                  >
                    Orçamento Estimado (€)
                  </label>
                </div>
              </div>

              {editingId && (
                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <div
                      ref={statusDropdownRef}
                      style={{ position: "relative" }}
                    >
                      <button
                        type="button"
                        className={`mb-input select ${
                          !formData.status_id ? "placeholder" : ""
                        }`}
                        onClick={() =>
                          setStatusDropdownOpen(!statusDropdownOpen)
                        }
                        style={{ textAlign: "left", cursor: "pointer" }}
                      >
                        {(() => {
                          const selectedStatus = statuses.find(
                            (s) => s.id.toString() === formData.status_id
                          );
                          return selectedStatus
                            ? translateStatus(selectedStatus.name)
                            : "";
                        })()}
                      </button>
                      <label
                        className={`mb-input-label ${
                          formData.status_id || statusDropdownOpen
                            ? "shrunken"
                            : ""
                        }`}
                      >
                        Status
                      </label>
                      <span className="mb-select-caret">▼</span>

                      {statusDropdownOpen && (
                        <ul
                          className="mb-select-menu"
                          style={{ maxHeight: "250px", overflowY: "auto" }}
                        >
                          {statuses
                            .filter((status) => {
                              const name = status.name.toLowerCase();
                              return (
                                name.includes("pendente") ||
                                name.includes("pending") ||
                                name.includes("finalizado") ||
                                name.includes("finalized") ||
                                name.includes("aguarda") ||
                                name.includes("waiting")
                              );
                            })
                            .map((status) => (
                              <li
                                key={status.id}
                                className={`mb-select-item ${
                                  formData.status_id === status.id.toString()
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() => {
                                  handleSelectChange(
                                    "status_id",
                                    status.id.toString()
                                  );
                                  setStatusDropdownOpen(false);
                                }}
                              >
                                {translateStatus(status.name)}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <div className="mb-input-wrapper">
                  <textarea
                    id="description"
                    className="mb-input textarea"
                    rows={3}
                    placeholder=""
                    value={formData.description}
                    onChange={handleInputChange}
                    onFocus={(e) =>
                      e.target.nextElementSibling?.classList.add("shrunken")
                    }
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.nextElementSibling?.classList.remove(
                          "shrunken"
                        );
                      }
                    }}
                  />
                  <label
                    className={`mb-input-label ${
                      formData.description ? "shrunken" : ""
                    }`}
                  >
                    Descrição
                  </label>
                </div>
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
                {loading
                  ? "A processar..."
                  : editingId
                  ? "Salvar Alterações"
                  : "Criar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
