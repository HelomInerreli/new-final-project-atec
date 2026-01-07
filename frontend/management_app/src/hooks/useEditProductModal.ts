/**
 * Hook personalizado para gerenciar o modal de edição de produtos.
 * Permite preencher formulário, validar e atualizar dados de produtos.
 */

import { useState, useEffect } from "react";
// Importa hooks do React
import http from "../api/http";
// Cliente HTTP
import { toast } from "./use-toast";
// Hook para toasts

// Interface para produto
interface Produto {
  id: string;
  partNumber: string;
  nome: string;
  descricao: string;
  quantidade: number;
  reserveQuantity?: number;
  preco: number;
  costValue: number;
  categoria: string;
  fornecedor: string;
  minimumStock: number;
}

// Interface para formulário de produto
interface ProductForm {
  partNumber: string;
  nome: string;
  descricao: string;
  quantidade: number | "";
  reserveQuantity: number | "";
  preco: number | "";
  costValue: number | "";
  categoria: string;
  fornecedor: string;
  minimumStock: number | "";
}

// Formulário inicial vazio
const INITIAL_FORM: ProductForm = {
  partNumber: "",
  nome: "",
  descricao: "",
  quantidade: "",
  reserveQuantity: "",
  preco: "",
  costValue: "",
  categoria: "",
  fornecedor: "",
  minimumStock: "",
};

/**
 * Hook para gerenciar modal de edição de produto.
 * @param show - Se o modal está visível
 * @param produto - Produto a editar
 * @param onSuccess - Callback de sucesso
 * @param onClose - Callback de fechar
 * @returns Estado e funções para o modal
 */
export const useEditProductModal = (
  show: boolean,
  produto: Produto | null,
  onSuccess: () => void,
  onClose: () => void
) => {
  // Estado do formulário
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  // Estado de submissão
  const [submitting, setSubmitting] = useState(false);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para preencher formulário quando produto muda
  useEffect(() => {
    if (show && produto) {
      setForm({
        partNumber: produto.partNumber || "",
        nome: produto.nome || "",
        descricao: produto.descricao || "",
        quantidade: produto.quantidade ?? "",
        reserveQuantity: produto.reserveQuantity ?? "",
        preco: produto.preco ?? "",
        costValue: produto.costValue ?? "",
        categoria: produto.categoria || "",
        fornecedor: produto.fornecedor || "",
        minimumStock: produto.minimumStock ?? "",
      });
      setError(null);
    } else if (!show) {
      setForm(INITIAL_FORM);
      setError(null);
    }
  }, [show, produto]);

  // Função para submeter formulário
  const handleSubmit = async () => {
    if (!produto) return;

    setError(null);

    // Validação
    if (!form.partNumber.trim()) {
      setError("Código da peça é obrigatório");
      return;
    }
    if (!form.nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    if (!form.descricao.trim()) {
      setError("Descrição é obrigatória");
      return;
    }
    if (!form.categoria) {
      setError("Categoria é obrigatória");
      return;
    }
    if (!form.fornecedor.trim()) {
      setError("Fornecedor é obrigatório");
      return;
    }
    if (form.quantidade === "" || Number(form.quantidade) < 0) {
      setError("Quantidade inválida");
      return;
    }
    if (form.preco === "" || Number(form.preco) < 0) {
      setError("Preço de venda inválido");
      return;
    }
    if (form.costValue === "" || Number(form.costValue) < 0) {
      setError("Custo inválido");
      return;
    }
    if (form.minimumStock === "" || Number(form.minimumStock) < 0) {
      setError("Estoque mínimo inválido");
      return;
    }

    setSubmitting(true);

    try {
      // Prepara payload
      const payload = {
        partNumber: form.partNumber.trim(),
        name: form.nome.trim(),
        description: form.descricao.trim(),
        category: form.categoria,
        brand: form.fornecedor.trim(),
        quantity: Number(form.quantidade),
        reserveQuantity: form.reserveQuantity ? Number(form.reserveQuantity) : 0,
        costValue: Number(form.costValue),
        saleValue: Number(form.preco),
        minimumStock: Number(form.minimumStock),
      };

      // Faz requisição PUT
      const idNum = Number(produto.id);
      await http.put(`/products/${idNum}`, payload);

      // Mostra toast de sucesso
      toast({
        title: "Sucesso!",
        description: "Produto atualizado com sucesso.",
      });

      // Chama sucesso
      onSuccess();
    } catch (err: any) {
      // Log erro
      console.error("Erro ao atualizar produto:", err);
      // Define erro
      setError(err?.response?.data?.detail || "Erro ao atualizar produto");
      // Mostra toast de erro
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      // Finaliza submissão
      setSubmitting(false);
    }
  };

  // Função para fechar modal
  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  // Retorna estado e funções
  return {
    form,
    setForm,
    submitting,
    error,
    handleSubmit,
    handleClose,
  };
};
