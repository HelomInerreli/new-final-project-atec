import http from "../api/http";
import type { ExtraService } from "../interfaces/appointment";

export const approveExtraService = async (requestId: number): Promise<ExtraService> => {
    const { data } = await http.patch<ExtraService>(`/extra_services/requests/${requestId}/approve`);
    return data;
};

export const rejectExtraService = async (requestId: number): Promise<ExtraService> => {
    const { data } = await http.patch<ExtraService>(`/extra_services/requests/${requestId}/reject`);
    return data;
};
