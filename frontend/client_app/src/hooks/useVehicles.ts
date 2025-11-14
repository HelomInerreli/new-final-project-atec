import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../api/auth';
import { useTranslation } from 'react-i18next';
import type { Vehicle } from '../interfaces/vehicle';
import { vehicleService } from '../services/vehicleServices';

/**
 * Hook para gerenciar veículos do cliente logado
 * Inclui operações CRUD, estados de loading/erro e controle de modal
 * @returns Objeto com estados, dados e funções para manipulação de veículos
 */
export function useVehicles() {
    /**
     * Hook de tradução para textos internacionalizados
     */
    const { t } = useTranslation();

    /**
     * Desestruturação do hook de autenticação
     * loggedInCustomerId: ID do cliente logado ou null
     * isLoggedIn: Status booleano de login
     */
    const { loggedInCustomerId, isLoggedIn } = useAuth();

    /**
     * Estado para armazenar a lista de veículos ativos do cliente
     * Tipo: Vehicle[] (array de objetos Vehicle)
     * Inicial: Array vazio
     */
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    /**
     * Estado para indicar carregamento de dados
     * Tipo: boolean
     * Inicial: true (assume carregamento inicial)
     */
    const [loading, setLoading] = useState<boolean>(true);

    /**
     * Estado para mensagens de erro
     * Tipo: string | null
     * Inicial: null (sem erro)
     */
    const [error, setError] = useState<string | null>(null);

    /**
     * Estado para controlar visibilidade do modal de edição/criação
     * Tipo: boolean
     * Inicial: false (modal fechado)
     */
    const [showModal, setShowModal] = useState(false);

    /**
     * Estado para veículo selecionado no modal
     * Tipo: Vehicle | null
     * Inicial: null (nenhum veículo selecionado)
     */
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    /**
     * Função para carregar veículos do cliente logado
     * Filtra apenas veículos ativos (não deletados)
     * @returns Promise<void>
     */
    const loadVehicles = useCallback(async () => {
        // Verifica se há cliente logado
        if (!loggedInCustomerId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Busca veículos via API
            const data = await vehicleService.getByCustomer(loggedInCustomerId);
            
            // Valida se resposta é array
            if (Array.isArray(data)) {
                // Filtra veículos não deletados
                const activeVehicles = data.filter(vehicle => !vehicle.deleted_at);
                setVehicles(activeVehicles);
            } else {
                // Dados inválidos
                setError(t('vehiclesPage.invalidData'));
            }
        } catch (error: any) {
            // Trata erro da API
            setError(error.message || t('vehiclesPage.errorLoading'));
        } finally {
            setLoading(false);
        }
    }, [loggedInCustomerId, t]);

    /**
     * Efeito para carregar veículos quando login/ID mudar
     */
    useEffect(() => {
        if (isLoggedIn && loggedInCustomerId) {
            loadVehicles();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, loggedInCustomerId, loadVehicles]);

    /**
     * Função para abrir modal de edição
     * @param vehicle - Veículo a ser editado
     */
    const handleEdit = useCallback((vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setShowModal(true);
    }, []);

    /**
     * Função para deletar veículo com confirmação
     * @param vehicleId - ID do veículo a deletar
     * @returns Promise<void>
     */
    const handleDelete = useCallback(async (vehicleId: number) => {
        // Confirmação do usuário
        if (!window.confirm(t('vehiclesPage.deleteConfirm'))) {
            return;
        }

        try {
            // Deleta via API
            await vehicleService.delete(vehicleId);
            
            // Remove do estado local
            setVehicles(prev => prev.filter(v => v.id !== vehicleId));
            
            // Feedback de sucesso
            alert(t('vehiclesPage.deleteSuccess'));
        } catch (error: any) {
            console.error('Erro ao eliminar veículo:', error);
            alert(error.message || t('vehiclesPage.deleteError'));
        }
    }, [t]);

    /**
     * Função para abrir modal de criação de novo veículo
     */
    const handleAddVehicle = useCallback(() => {
        setSelectedVehicle(null);
        setShowModal(true);
    }, []);

    /**
     * Função para fechar modal e limpar seleção
     */
    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setSelectedVehicle(null);
    }, []);

    /**
     * Função para salvar veículo (criar ou editar)
     * @param vehicleData - Dados do veículo a salvar
     * @returns Promise<void>
     */
    const handleSaveVehicle = useCallback(async (vehicleData: Vehicle) => {
        try {
            // Verifica se é edição ou criação
            const isEditing = !!selectedVehicle?.id;

            if (isEditing && selectedVehicle.id) {
                // Edição: remove campos não editáveis e atualiza
                const { id, deleted_at, customer_id, ...updateData } = vehicleData;
                await vehicleService.update(selectedVehicle.id, updateData);
            } else {
                // Criação: remove campos não necessárias
                const { id, deleted_at, ...createData } = vehicleData;
                await vehicleService.create(createData);
            }

            // Recarrega lista após salvar
            await loadVehicles();

            // Feedback de sucesso
            const successMessage = isEditing
                ? t('vehiclesPage.updateSuccess')
                : t('vehiclesPage.addSuccess');
            alert(successMessage);
        } catch (error: any) {
            console.error('Erro ao salvar veículo:', error);
            alert(error.message || t('vehiclesPage.saveError'));
            throw error; // Re-throw para tratamento externo
        }
    }, [selectedVehicle, loadVehicles, t]);

    /**
     * Retorno do hook com todos os estados e funções
     */
    return {
        vehicles,           // Lista de veículos ativos
        loading,            // Status de carregamento
        error,              // Mensagem de erro
        showModal,          // Controle do modal
        selectedVehicle,    // Veículo selecionado
        loggedInCustomerId, // ID do cliente (para conveniência)
        isLoggedIn,         // Status de login (para conveniência)
        loadVehicles,       // Função para recarregar veículos
        handleEdit,         // Abrir modal de edição
        handleDelete,       // Deletar veículo
        handleAddVehicle,   // Abrir modal de criação
        handleCloseModal,   // Fechar modal
        handleSaveVehicle,  // Salvar veículo
    };
}