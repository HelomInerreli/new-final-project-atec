import api from "../api/http";
import type { CostBreakdown } from "../interfaces/costBreakdown";

/**
 * Busca o breakdown discriminado de custos de uma ordem de serviço
 * Retorna mão de obra e peças discriminadas para serviço base e extras
 * @param appointmentId - ID da ordem de serviço
 * @returns Promise com o breakdown de custos
 */
export async function getCostBreakdown(
  appointmentId: number
): Promise<CostBreakdown> {
  try {
    const response = await api.get(
      `/appointments/${appointmentId}/cost-breakdown`
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar breakdown de custos:", error);
    throw error;
  }
}
