export type StockStatus = "Normal" | "Baixo" | "Crítico" | "Esgotado";

export interface Product {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  quantity: number;
  reserveQuantity: number;
  costValue: number;
  saleValue: number;
  minimumStock: number;
  status: StockStatus;
}
