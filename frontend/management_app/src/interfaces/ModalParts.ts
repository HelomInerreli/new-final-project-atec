import { type Product } from "../services/productService";

export interface AddPartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

export interface UseAddPartsModalReturn {
  products: Product[];
  filteredProducts: Product[];
  search: string;
  setSearch: (search: string) => void;
  loading: boolean;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  quantityError: string | null;
  adding: boolean;
  handleAddPart: () => Promise<void>;
}

export const validateQuantity = (
  quantity: number,
  product: Product | null
): string | null => {
  if (!product) return null;

  if (quantity < 1) {
    return "A quantidade deve ser pelo menos 1";
  }

  if (quantity > product.quantity) {
    return `Quantidade excede o stock disponível (${product.quantity} unidade${product.quantity !== 1 ? 's' : ''})`;
  }

  return null;
};