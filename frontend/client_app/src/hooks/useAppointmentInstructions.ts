import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type AppointmentForm } from '../interfaces/appointment';
import { type Service } from '../interfaces/service';

export function useAppointmentInstructions(
  step: number,
  form: AppointmentForm,
  services: Service[],
  selectedDate: string,
  selectedTime: string
): string {
  const { t } = useTranslation();

  const instruction = useMemo(() => {
    // Step 1: Service Selection
    if (step === 1) {
      if (!form.service_id) {
        return t('appointmentModal.selectService', { 
          defaultValue: 'Selecione o serviço' 
        });
      }
      const svc = services.find(s => s.id === form.service_id);
      return svc
        ? t('appointmentModal.serviceSelected', { 
            service: svc.name, 
            defaultValue: `Serviço: ${svc.name} — clique Seguinte` 
          })
        : t('appointmentModal.serviceSelectedFallback', { 
            defaultValue: 'Serviço selecionado — clique Seguinte' 
          });
    }

    // Step 2: Details
    if (!selectedDate || !selectedTime) {
      return t('appointmentModal.chooseDateTime', { 
        defaultValue: 'Escolha data e hora' 
      });
    }
    if (!form.vehicle_id) {
      return t('appointmentModal.selectVehicle', { 
        defaultValue: 'Selecione um veículo' 
      });
    }
    if (!form.description || form.description.trim().length <= 3) {
      return t('appointmentModal.describeProblem', { 
        defaultValue: 'Descreva o problema (mín. 4 caracteres)' 
      });
    }
    
    return t('appointmentModal.readyToSubmit', { 
      defaultValue: 'Tudo preenchido — pode enviar o agendamento' 
    });
  }, [step, form, services, selectedDate, selectedTime, t]);

  return instruction;
}