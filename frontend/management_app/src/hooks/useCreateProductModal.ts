/**
 * Hook personalizado para gerenciar o modal de criação de produto.
 * Permite validar e submeter formulário de criação de produto.
 */

import { useState, useEffect } from "react";
// Importa hooks do React
import http from "../api/http";
// Cliente HTTP configurado
import { toast } from "./use-toast";
// Hook para notificações toast

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
 * Hook para gerenciar modal de criação de produto.
 * @param show - Indica se modal está visível
 * @param onSuccess - Callback para sucesso
 * @param onClose - Callback para fechar
 * @returns Estado e funções para o modal
 */
export const useCreateProductModal = (
  show: boolean,
  onSuccess: () => void,
  onClose: () => void
) => {
  // Estado do formulário
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  // Estado de submissão
  const [submitting, setSubmitting] = useState(false);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para resetar formulário quando modal abre
  useEffect(() => {
    if (show) {
      setForm(INITIAL_FORM);
      setError(null);
    }
  }, [show]);

  // Função para submeter formulário
  const handleSubmit = async () => {
    // Limpa erro
    setError(null);

    // Validações
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

    // Inicia submissão
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

      // Faz requisição POST
      await http.post("/products/", payload);

      // Mostra sucesso
      toast({
        title: "Sucesso!",
        description: "Produto criado com sucesso.",
      });

      // Chama callback de sucesso
      onSuccess();
    } catch (err: any) {
      // Log erro
      console.error("Erro ao criar produto:", err);
      // Define erro
      setError(err?.response?.data?.detail || "Erro ao criar produto");
      // Mostra toast de erro
      toast({
        title: "Erro",
        description: "Erro ao criar produto. Tente novamente.",
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
