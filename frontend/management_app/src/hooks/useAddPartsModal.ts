import { useState, useEffect } from "react";
import { getProducts, addPartToOrder, type Product } from "../services/productService";
import { toast } from "sonner";
import { validateQuantity, type UseAddPartsModalReturn } from "../interfaces/ModalParts";

export const useAddPartsModal = (
  isOpen: boolean,
  orderId: string,
  onSuccess: () => void,
  onClose: () => void
): UseAddPartsModalReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.partNumber && p.partNumber.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [search, products]);

  useEffect(() => {
    const error = validateQuantity(quantity, selectedProduct);
    setQuantityError(error);
  }, [quantity, selectedProduct]);


  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      const inStock = data.filter(p => p.quantity > 0);
      setProducts(inStock);
      setFilteredProducts(inStock);
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
  };

  const handleAddPart = async () => {
    if (!selectedProduct) {
      toast.error("Por favor, selecione uma peça");
      return;
    }

    const validationError = validateQuantity(quantity, selectedProduct);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setAdding(true);
    try {
      await addPartToOrder(orderId, selectedProduct.id, quantity);
      toast.success(`Peça "${selectedProduct.name}" adicionada com sucesso!`);
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao adicionar peça:", error);
      const errorMessage = error.message || "Erro ao adicionar peça";
      toast.error(errorMessage);
    } finally {
      setAdding(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setSearch("");
    setQuantityError(null);
  };

  return {
    products,
    filteredProducts,
    search,
    setSearch,
    loading,
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity: handleQuantityChange,
    quantityError,
    adding,
    handleAddPart,
  };
};