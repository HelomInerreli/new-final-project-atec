// Tipo para status da ordem
export type OrderStatus = 'Em Andamento' | 'Pendente' | 'Concluída' | 'Cancelada';

// Interface para ordem
export interface Order {
  id: string;
  client: string;
  service: string;
  vehicle: string;
  date: string;
  value: number;
  status: OrderStatus;
}

