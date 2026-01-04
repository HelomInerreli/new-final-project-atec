import { useState, useEffect } from 'react';
import { useAuth } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleServices';
import { serviceService, appointmentService } from '../services/service';
import type { AppointmentForm, CreateAppointmentData } from '../interfaces/appointment';
import type { Vehicle } from '../interfaces/vehicle';
import type { Service } from '../interfaces/service';

export const useAppointmentModal = (show: boolean, onSuccess: () => void, onClose: () => void) => {
    const navigate = useNavigate();
    const { loggedInCustomerId, isLoggedIn } = useAuth();
    
    // Estados
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<AppointmentForm>({
        appointment_date: '',
        description: '',
        estimated_budget: 0,
        vehicle_id: 0,
        service_id: 0,
    });
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    
    const getInitialDate = () => {
        const now = new Date();
        if (now.getHours() >= 17) {
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            return tomorrow;
        }
        return now;
    };
    
    const [selectData, setSelectData] = useState<Date | null>(getInitialDate());
    const [selectedTime, setSelectedTime] = useState<string>('09:00');

    // Funções utilitárias
    const isTimeSlotAvailable = (time: string): boolean => {
        if (!selectData) return true;
        const selectedDate = new Date(selectData);
        const today = new Date();
        
        if (selectedDate.toDateString() !== today.toDateString()) {
            return true;
        }

        const [hours, minutes] = time.split(':').map(Number);
        const currentHour = today.getHours();
        const currentMinutes = today.getMinutes();

        if (hours < currentHour) {
            return false;
        }

        if (hours === currentHour && minutes <= currentMinutes) {
            return false;
        }

        return true;
    };

    const isTodayAndAfterLastSlot = () => {
        if (!selectData) return false;
        const now = new Date();
        const selected = new Date(selectData);
        return (
            selected.toDateString() === now.toDateString() &&
            now.getHours() >= 17
        );
    };

    // Navegação entre steps
    const goToNextStep = () => {
        if (currentStep === 1) {
            if (!isLoggedIn) {
                navigate('/register', {
                    state: {
                        message: 'Por favor, faça login para agendar um serviço',
                        returnTo: '/appointments'
                    }
                });
                onClose();
                return;
            }

            if (!formData.service_id || !selectData || !selectedTime) {
                setError('Preencha todos os campos obrigatórios do passo 1');
                return;
            }

            // Criar a data no timezone local para evitar problemas de conversão
            const dateTime = new Date(selectData);
            const [hours, minutes] = selectedTime.split(':');
            dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            // Calcular o orçamento estimado baseado no serviço selecionado
            const selectedService = services.find(s => s.id === formData.service_id);
            const estimatedBudget = selectedService?.price || 0;

            setFormData(prev => ({
                ...prev,
                appointment_date: dateTime.toISOString(),
                estimated_budget: estimatedBudget
            }));

            setError(null);
            setCurrentStep(2);
        }

        if (currentStep === 2) {
            if (!formData.vehicle_id) {
                setError('Selecione um veículo');
                return;
            }
            setError(null);
            setCurrentStep(3);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    };

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn || !loggedInCustomerId) {
            setError('Usuário não está logado');
            return;
        }

        if (!formData.vehicle_id || !formData.service_id || !formData.appointment_date) {
            setError('Preencha todos os campos obrigatórios');
            return;
        }

        try {
            setLoading(true);
            
            // Se não há descrição, usar descrição padrão baseada no serviço
            let description = formData.description;
            if (!description || description.trim() === '') {
                const selectedService = services.find(s => s.id === formData.service_id);
                description = `Agendamento para ${selectedService?.name || 'serviço'}. ${selectedService?.description || ''}`;
            }
            
            const appointmentData: CreateAppointmentData = {
                ...formData,
                description,
                customer_id: loggedInCustomerId,
            };
            await appointmentService.create(appointmentData);
            onSuccess();
            resetForm();
            handleClose();
        } catch (error) {
            setError('Erro ao criar agendamento');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            appointment_date: '',
            description: '',
            estimated_budget: 0,
            vehicle_id: 0,
            service_id: 0,
        });
        setSelectData(getInitialDate());
        setSelectedTime('09:00');
        setCurrentStep(1);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Fetch data
    useEffect(() => {
        if (!isLoggedIn || !loggedInCustomerId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const [vehiclesData, servicesData] = await Promise.all([
                    vehicleService.getByCustomer(loggedInCustomerId),
                    serviceService.getAll()
                ]);
                setVehicles(vehiclesData);
                setServices(servicesData);
                setLoading(false);
            } catch (error) {
                setError('Erro ao carregar dados');
                setLoading(false);
            }
        };

        fetchData();
    }, [isLoggedIn, loggedInCustomerId]);

    // Auto-select available time
    useEffect(() => {
        if (selectData && !isTimeSlotAvailable(selectedTime)) {
            const timeSlots: string[] = [];
            for (let hour = 9; hour <= 17; hour++) {
                timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
                if (hour < 17) {
                    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
                }
            }
            
            const availableTime = timeSlots.find(time => isTimeSlotAvailable(time));
            if (availableTime) {
                setSelectedTime(availableTime);
            }
        }
    }, [selectData]);

    return {
        // Estados
        currentStep,
        loading,
        error,
        formData,
        setFormData,
        vehicles,
        services,
        selectData,
        setSelectData,
        selectedTime,
        setSelectedTime,
        isLoggedIn,
        
        // Funções
        goToNextStep,
        goToPreviousStep,
        handleSubmit,
        handleClose,
        isTimeSlotAvailable,
        isTodayAndAfterLastSlot,
        getInitialDate,
    };
};