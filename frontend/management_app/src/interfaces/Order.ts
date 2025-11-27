export type OrderStatus = 'Em Andamento' | 'Pendente' | 'Concluída' | 'Cancelada';

export interface Order {
  id: string;
  client: string;
  service: string;
  vehicle: string;
  date: string;
  value: number;
  status: OrderStatus;
}

