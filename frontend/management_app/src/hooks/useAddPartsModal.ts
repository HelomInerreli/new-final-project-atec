/**
 * Hook personalizado para gerenciar o modal de adição de peças a uma ordem de serviço.
 * Permite buscar produtos, filtrar, validar quantidade e adicionar peças.
 */

import { useState, useEffect } from "react";
// Importa hooks do React para estado e efeitos
import { getProducts, addPartToOrder, type Product } from "../services/productService";
// Serviços e tipos para produtos
import { validateQuantity, type UseAddPartsModalReturn } from "../interfaces/ModalParts";
// Função de validação e tipos para o modal de peças
import { toast } from "../hooks/use-toast";
// Hook para notificações toast

/**
 * Hook para gerenciar o modal de adição de peças.
 * @param isOpen - Indica se o modal está aberto
 * @param orderId - ID da ordem de serviço
 * @param onSuccess - Callback para sucesso
 * @param onClose - Callback para fechar modal
 * @returns Objeto com estado e funções para o modal
 */
export const useAddPartsModal = (
  isOpen: boolean,
  orderId: string,
  onSuccess: () => void,
  onClose: () => void
): UseAddPartsModalReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  // Estado para lista de produtos
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  // Estado para produtos filtrados
  const [search, setSearch] = useState("");
  // Estado para termo de pesquisa
  const [loading, setLoading] = useState(false);
  // Estado de carregamento
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Estado para produto selecionado
  const [quantity, setQuantity] = useState(1);
  // Estado para quantidade
  const [adding, setAdding] = useState(false);
  // Estado de adição em progresso
  const [quantityError, setQuantityError] = useState<string | null>(null);
  // Estado de erro de quantidade

  // Efeito para carregar produtos quando o modal abre
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  // Efeito para filtrar produtos baseado na pesquisa
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

  // Efeito para validar quantidade
  useEffect(() => {
    const error = validateQuantity(quantity, selectedProduct);
    setQuantityError(error);
  }, [quantity, selectedProduct]);

  // Função para carregar produtos
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

  // Função para alterar quantidade
  const handleQuantityChange = (value: number) => {
    setQuantity(value);
  };

  // Função para adicionar peça
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

  // Função para resetar formulário
  const resetForm = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setSearch("");
    setQuantityError(null);
  };

  return {
    products, // Lista de produtos
    filteredProducts, // Produtos filtrados
    search, // Termo de pesquisa
    setSearch, // Função para alterar pesquisa
    loading, // Indicador de carregamento
    selectedProduct, // Produto selecionado
    setSelectedProduct, // Função para selecionar produto
    quantity, // Quantidade
    setQuantity: handleQuantityChange, // Função para alterar quantidade
    quantityError, // Erro de quantidade
    adding, // Indicador de adição
    handleAddPart, // Função para adicionar peça
  };
};