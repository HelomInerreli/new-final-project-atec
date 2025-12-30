import { useState, useEffect } from "react";
import http from "../api/http";
import { toast } from "./use-toast";

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

export const useCreateProductModal = (
  show: boolean,
  onSuccess: () => void,
  onClose: () => void
) => {
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setForm(INITIAL_FORM);
      setError(null);
    }
  }, [show]);

  const handleSubmit = async () => {
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

      await http.post("/products/", payload);

      toast({
        title: "Sucesso!",
        description: "Produto criado com sucesso.",
      });

      onSuccess();
    } catch (err: any) {
      console.error("Erro ao criar produto:", err);
      setError(err?.response?.data?.detail || "Erro ao criar produto");
      toast({
        title: "Erro",
        description: "Erro ao criar produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return {
    form,
    setForm,
    submitting,
    error,
    handleSubmit,
    handleClose,
  };
};
