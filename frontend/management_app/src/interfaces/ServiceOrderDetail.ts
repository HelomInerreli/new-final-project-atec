export interface StatusAction {
  action: "start" | "pause" | "finish";
  label: string;
  statusId: number;
}

export const STATUS_LABEL_TO_ID: Record<string, number> = {
  "Pendente": 1,
  "Cancelada": 2,
  "Concluída": 3,
  "Em Andamento": 4,
  "Aguardando Aprovação": 5,
  "Aguardando Pagamento": 6,
};