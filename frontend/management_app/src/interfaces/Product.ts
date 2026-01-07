// Tipo para status do stock
export type StockStatus = "Normal" | "Baixo" | "Crítico" | "Esgotado";
// Tipo para categoria do produto
export type ProductCategory =
  | "Peças"
  | "Acessórios"
  | "Fluidos"
  | "Consumíveis"
  | "Ferramentas"
  | "Equipamentos"
  | "Outros";

// Interface para produto
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
