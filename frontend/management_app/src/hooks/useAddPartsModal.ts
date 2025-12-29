import { useState, useEffect } from "react";
import { getProducts, addPartToOrder, type Product } from "../services/productService";
import { validateQuantity, type UseAddPartsModalReturn } from "../interfaces/ModalParts";
import { toast } from "../hooks/use-toast";

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
      toast({
      title: "Erro",
      description: "Erro ao carregar produtos",
      variant: "destructive",
      duration: 3000,
      });
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
      toast({
      title: "Erro",
      description: "Por favor, selecione uma peça",
      variant: "destructive",
      duration: 3000,
      });
      return;
    }

    const validationError = validateQuantity(quantity, selectedProduct);
    if (validationError) {
      toast({
      title: "Erro de validação",
      description: validationError,
      variant: "destructive",
      duration: 3000,
      });
      return;
    }

    setAdding(true);
    try {
      await addPartToOrder(orderId, selectedProduct.id, quantity);
      
      toast({
        title: "Peça adicionada!",
        description: `${quantity} un. de ${selectedProduct.name} adicionada com sucesso.`,
        duration: 3000,
      });
      
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao adicionar peça:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a peça. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
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