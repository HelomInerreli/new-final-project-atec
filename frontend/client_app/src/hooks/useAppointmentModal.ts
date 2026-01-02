import { useState, useEffect } from 'react';
import { useAuth } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleServices';
import { serviceService, appointmentService } from '../services/service';
import type { AppointmentForm, CreateAppointmentData } from '../interfaces/appointment';
import type { Vehicle } from '../interfaces/vehicle';
import type { Service } from '../interfaces/service';

/**
 * Hook para gerir o modal de criação de agendamentos
 * @param show - Estado de visibilidade do modal
 * @param onSuccess - Callback executado quando o agendamento é criado com sucesso
 * @param onClose - Callback para fechar o modal
 * @returns Objeto com estados, dados e ações do modal de agendamento
 */
export const useAppointmentModal = (show: boolean, onSuccess: () => void, onClose: () => void) => {
    /**
     * Hook para navegação entre rotas
     */
    const navigate = useNavigate();
    
    /**
     * Hook de autenticação
     * loggedInCustomerId - ID do cliente autenticado
     * isLoggedIn - Estado de autenticação do utilizador
     */
    const { loggedInCustomerId, isLoggedIn } = useAuth();
    
    /**
     * Estado para controlar o passo atual do formulário (1, 2 ou 3)
     * Tipo: number
     * Inicia em 1 (primeiro passo)
     */
    const [currentStep, setCurrentStep] = useState<number>(1);

    /**
     * Estado para indicar se os dados estão sendo carregados
     * Tipo: boolean
     * Inicia como true
     */
    const [loading, setLoading] = useState<boolean>(true);

    /**
     * Estado para armazenar mensagens de erro
     * Tipo: string | null
     * Inicia como null (sem erro)
     */
    const [error, setError] = useState<string | null>(null);

    /**
     * Estado para armazenar os dados do formulário de agendamento
     * Tipo: AppointmentForm
     * Inicia com valores padrão vazios
     */
    const [formData, setFormData] = useState<AppointmentForm>({
        appointment_date: '',
        description: '',
        estimated_budget: 0,
        vehicle_id: 0,
        service_id: 0,
    });

    /**
     * Estado para armazenar a lista de veículos do cliente
     * Tipo: Array de Vehicle
     * Inicia como array vazio
     */
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    /**
     * Estado para armazenar a lista de serviços disponíveis
     * Tipo: Array de Service
     * Inicia como array vazio
     */
    const [services, setServices] = useState<Service[]>([]);
    
    /**
     * Função para obter a data inicial para o agendamento
     * Se for após as 17h, retorna o dia seguinte; caso contrário, retorna hoje
     * @returns Data inicial para o calendário
     */
    const getInitialDate = () => {
        const now = new Date();
        if (now.getHours() >= 17) {
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            return tomorrow;
        }
        return now;
    };
    
    /**
     * Estado para armazenar a data selecionada para o agendamento
     * Tipo: Date | null
     * Inicia com a data inicial calculada
     */
    const [selectData, setSelectData] = useState<Date | null>(getInitialDate());

    /**
     * Estado para armazenar a hora selecionada para o agendamento
     * Tipo: string
     * Inicia como '09:00' (primeira hora disponível)
     */
    const [selectedTime, setSelectedTime] = useState<string>('09:00');

    /**
     * Função para verificar se um horário está disponível
     * Valida se o horário já passou caso seja hoje
     * @param time - Horário no formato 'HH:MM'
     * @returns true se o horário está disponível, false caso contrário
     */
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

    /**
     * Função para verificar se é hoje e já passou do último horário disponível (17h)
     * @returns true se for hoje e já for após 17h, false caso contrário
     */
    const isTodayAndAfterLastSlot = () => {
        if (!selectData) return false;
        const now = new Date();
        const selected = new Date(selectData);
        return (
            selected.toDateString() === now.toDateString() &&
            now.getHours() >= 17
        );
    };

    /**
     * Função para avançar para o próximo passo do formulário
     * Valida os campos obrigatórios de cada passo antes de avançar
     * No passo 1: verifica login, serviço, data e hora
     * No passo 2: verifica veículo selecionado
     */
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

            const dateTime = new Date(selectData);
            const [hours, minutes] = selectedTime.split(':');
            dateTime.setHours(parseInt(hours), parseInt(minutes));

            setFormData(prev => ({
                ...prev,
                appointment_date: dateTime.toISOString()
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

    /**
     * Função para voltar ao passo anterior do formulário
     * Limpa mensagens de erro ao voltar
     */
    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    };

    /**
     * Função para submeter o formulário e criar o agendamento
     * Valida autenticação e campos obrigatórios antes de enviar
     * Chama callbacks de sucesso e fecho após criação bem-sucedida
     * @param e - Evento de submit do formulário
     */
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
            const appointmentData: CreateAppointmentData = {
                ...formData,
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

    /**
     * Função para resetar o formulário aos valores iniciais
     * Limpa todos os campos e volta ao passo 1
     */
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

    /**
     * Função para fechar o modal
     * Reset do formulário antes de fechar
     */
    const handleClose = () => {
        resetForm();
        onClose();
    };

    /**
     * Efeito para carregar veículos e serviços quando o utilizador está autenticado
     * Executa ao montar o componente ou quando o estado de login muda
     */
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

    /**
     * Efeito para selecionar automaticamente um horário disponível
     * Quando a data muda, verifica se o horário atual ainda está disponível
     * Se não estiver, seleciona o próximo horário disponível
     */
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
        /**
         * Passo atual do formulário
         */
        currentStep,

        /**
         * Estado de carregamento
         */
        loading,

        /**
         * Mensagem de erro, se houver
         */
        error,

        /**
         * Dados do formulário
         */
        formData,

        /**
         * Função para atualizar o formulário
         */
        setFormData,

        /**
         * Lista de veículos do cliente
         */
        vehicles,

        /**
         * Lista de serviços disponíveis
         */
        services,

        /**
         * Data selecionada para o agendamento
         */
        selectData,

        /**
         * Função para atualizar a data selecionada
         */
        setSelectData,

        /**
         * Hora selecionada para o agendamento
         */
        selectedTime,

        /**
         * Função para atualizar a hora selecionada
         */
        setSelectedTime,

        /**
         * Estado de autenticação do utilizador
         */
        isLoggedIn,
        
        /**
         * Função para avançar para o próximo passo
         */
        goToNextStep,

        /**
         * Função para voltar ao passo anterior
         */
        goToPreviousStep,

        /**
         * Função para submeter o formulário
         */
        handleSubmit,

        /**
         * Função para fechar o modal
         */
        handleClose,

        /**
         * Função para verificar se um horário está disponível
         */
        isTimeSlotAvailable,

        /**
         * Função para verificar se é hoje e já passou do último horário
         */
        isTodayAndAfterLastSlot,

        /**
         * Função para obter a data inicial
         */
        getInitialDate,
    };
};