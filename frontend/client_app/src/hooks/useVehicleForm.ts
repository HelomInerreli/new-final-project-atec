import { useState, useEffect } from "react";
import type { Vehicle } from "../interfaces/vehicle";
import { validateVehicleForm } from "../utils/validation";

/**
 * Hook para gerir o formulário de veículos (criar/editar)
 * @param vehicle - Veículo a ser editado (null para criar novo)
 * @param customerId - ID do cliente proprietário do veículo
 * @param t - Função de tradução para mensagens de erro
 * @returns Objeto com dados do formulário, erros, estado de loading e funções de manipulação
 */
export function useVehicleForm(
    vehicle: Vehicle | null,
    customerId: number,
    t: (key: string) => string
) {
    /**
     * Estado para armazenar os dados do formulário de veículo
     * Tipo: Vehicle
     * Inicia com valores vazios e customer_id do cliente
     */
    const [formData, setFormData] = useState<Vehicle>({
        plate: "",
        brand: "",
        model: "",
        kilometers: 0,
        customer_id: customerId,
    });

    /**
     * Estado para armazenar erros de validação do formulário
     * Tipo: Record com nome do campo e mensagem de erro
     * Inicia como objeto vazio (sem erros)
     */
    const [errors, setErrors] = useState<Record<string, string>>({});

    /**
     * Estado para indicar se o formulário está sendo submetido
     * Tipo: boolean
     * Inicia como false
     */
    const [loading, setLoading] = useState(false);

    /**
     * Efeito para carregar dados do veículo quando em modo de edição
     * Preenche o formulário com dados existentes ou reseta para valores vazios
     * Executa quando o veículo ou customer_id mudam
     */
    useEffect(() => {
        if (vehicle) {
            setFormData({
                ...vehicle,
                customer_id: vehicle.customer_id || customerId,
            });
        } else {
            setFormData({
                plate: "",
                brand: "",
                model: "",
                kilometers: 0,
                customer_id: customerId,
            });
        }
        setErrors({});
    }, [vehicle, customerId]);

    /**
     * Função para manipular alterações nos campos do formulário
     * Converte valores para maiúsculas (exceto quilómetros)
     * Limpa erros do campo quando o utilizador começa a digitar
     * @param e - Evento de mudança do input
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "kilometers" ? parseInt(value) || 0 : value.toUpperCase(),
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    /**
     * Função para submeter o formulário de veículo
     * Valida os dados antes de enviar
     * Chama callback de sucesso e fecha o formulário após guardar
     * @param e - Evento de submit do formulário
     * @param onSave - Callback para guardar os dados do veículo
     * @param onClose - Callback para fechar o formulário
     */
    const handleSubmit = async (
        e: React.FormEvent,
        onSave: (data: Vehicle) => Promise<void>,
        onClose: () => void
    ) => {
        e.preventDefault();
        const newErrors = validateVehicleForm(formData, t);
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setLoading(true);
            await onSave({ ...formData, customer_id: customerId });
            onClose();
        } catch (error) {
            console.error("Erro ao salvar veículo:", error);
        } finally {
            setLoading(false);
        }
    };

    return { 
        /**
         * Dados atuais do formulário
         */
        formData, 
        
        /**
         * Erros de validação por campo
         */
        errors, 
        
        /**
         * Estado de submissão do formulário
         */
        loading, 
        
        /**
         * Função para manipular alterações nos campos
         */
        handleChange, 
        
        /**
         * Função para submeter o formulário
         */
        handleSubmit 
    };
}
