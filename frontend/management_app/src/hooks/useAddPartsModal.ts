import { useState, useEffect } from "react";
import { getProducts, addPartToOrder, type Product } from "../services/productService";

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
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
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
      alert("Erro ao carregar produtos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async () => {
    if (!selectedProduct) {
      alert("Selecione um produto");
      return;
    }

    if (quantity < 1) {
      alert("Quantidade inválida");
      return;
    }

    if (quantity > selectedProduct.quantity) {
      alert(`Stock insuficiente! Disponível: ${selectedProduct.quantity}`);
      return;
    }

    setAdding(true);
    try {
      await addPartToOrder(orderId, selectedProduct.id, quantity);
      alert("Peça adicionada com sucesso!");
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message);
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