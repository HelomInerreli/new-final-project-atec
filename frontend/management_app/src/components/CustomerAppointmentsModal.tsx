/**
 * Componente modal para exibir agendamentos de um cliente.
 * Mostra lista de agendamentos com detalhes como serviço, data, veículo, etc.
 */

import { Calendar } from "lucide-react";
// Ícone de calendário
import { Spinner } from "react-bootstrap";
// Spinner de carregamento
import Badge from "react-bootstrap/Badge";
// Badge do Bootstrap
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
// Componentes de dialog
import type { Appointment } from "../interfaces/Appointment";
// Tipo Appointment

// Interface de props do modal
interface CustomerAppointmentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  loading: boolean;
}

// Componente funcional para modal de agendamentos do cliente
export function CustomerAppointmentsModal({
  open,
  onOpenChange,
  appointments,
  loading,
}: CustomerAppointmentsModalProps) {
  // Renderiza modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Agendamentos do Cliente</DialogTitle>
          <DialogDescription>
            Visualize todos os agendamentos deste cliente
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="danger" />
            <span className="ms-3">A Carregar Agendamentos...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-5">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhum agendamento encontrado para este cliente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="p-4 hover:bg-muted/50 transition-colors"
                style={{ border: '1px solid #dc3545', borderRadius: '8px' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {appointment.service?.name || appointment.service_name || 'Serviço não especificado'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.description || 'Sem descrição'}
                    </p>
                  </div>
                  <Badge 
                    bg={
                      appointment.status?.name === 'Pendente' ? 'warning' :
                      appointment.status?.name === 'Canceled' ? 'danger' :
                      appointment.status?.name === 'Finalized' ? 'success' :
                      'secondary'
                    }
                  >
                    {appointment.status?.name || 'N/A'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Data:</span>
                    <p className="font-medium">
                      {appointment.appointment_date 
                        ? new Date(appointment.appointment_date).toLocaleDateString('pt-PT', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Veículo:</span>
                    <p className="font-medium">{appointment.vehicle_info || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Orçamento Estimado:</span>
                    <p className="font-medium">€{appointment.estimated_budget?.toFixed(2) || '0.00'}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Orçamento Real:</span>
                    <p className="font-medium">€{appointment.actual_budget?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                
                {appointment.extra_services && appointment.extra_services.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Serviços Extra:</p>
                    <div className="flex flex-wrap gap-2">
                      {appointment.extra_services.map((extra: any, idx: number) => (
                        <Badge key={idx} bg="info" className="text-xs">
                          {extra.name || 'Serviço Extra'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
