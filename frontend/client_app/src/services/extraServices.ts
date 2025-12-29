import http from "../api/http";
import type { ExtraService } from "../interfaces/appointment";

/**
 * Aprova um pedido de serviço extra
 * Envia requisição PATCH para aprovar serviço adicional solicitado
 * @param requestId - ID numérico do pedido de serviço extra
 * @returns Promise com objeto ExtraService atualizado (status aprovado)
 * @throws Erro HTTP se pedido não for encontrado ou falhar a aprovação
 */
export const approveExtraService = async (requestId: number): Promise<ExtraService> => {
    const { data } = await http.patch<ExtraService>(`/extra_services/requests/${requestId}/approve`);
    return data;
};

/**
 * Rejeita um pedido de serviço extra
 * Envia requisição PATCH para recusar serviço adicional solicitado
 * @param requestId - ID numérico do pedido de serviço extra
 * @returns Promise com objeto ExtraService atualizado (status rejeitado)
 * @throws Erro HTTP se pedido não for encontrado ou falhar a rejeição
 */
export const rejectExtraService = async (requestId: number): Promise<ExtraService> => {
    const { data } = await http.patch<ExtraService>(`/extra_services/requests/${requestId}/reject`);
    return data;
};
