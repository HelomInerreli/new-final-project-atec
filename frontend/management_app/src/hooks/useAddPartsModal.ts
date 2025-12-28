import { useState, useEffect } from "react";
import { getProducts, addPartToOrder, type Product } from "../services/productService";
import { toast } from "../hooks/use-toast";

export const useAddPartsModal = (isOpen: boolean, orderId: string, onSuccess: () => void, onClose: () => void) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

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

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      const inStock = data.filter(p => p.quantity > 0);
      setProducts(inStock);
      setFilteredProducts(inStock);
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async () => {
    // Validações (botão já está disabled no componente, mas mantemos por segurança)
    if (!selectedProduct || quantity < 1 || quantity > selectedProduct.quantity) {
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
    setQuantity,
    adding,
    handleAddPart,
  };
};