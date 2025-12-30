import { type FC, useState, useRef, useEffect } from "react";
import { useEditProductModal } from "../hooks/useEditProductModal";
import "../styles/CreateServiceOrderModal.css";
import "./inputs.css";

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

interface EditProductModalProps {
  show: boolean;
  produto: Produto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const categorias = [
  "Peças",
  "Acessórios",
  "Fluidos",
  "Consumíveis",
  "Ferramentas",
  "Equipamentos",
  "Outros",
];

const EditProductModal: FC<EditProductModalProps> = ({ show, produto, onClose, onSuccess }) => {
  const [categoriaDropdownOpen, setCategoriaDropdownOpen] = useState(false);
  const categoriaDropdownRef = useRef<HTMLDivElement>(null);

  const {
    form,
    setForm,
    submitting,
    error,
    handleSubmit,
    handleClose,
  } = useEditProductModal(show, produto, onSuccess, onClose);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriaDropdownRef.current && !categoriaDropdownRef.current.contains(event.target as Node)) {
        setCategoriaDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!show) return null;

  return (
    <div className="service-order-modal-overlay" onClick={handleClose}>
      <div className="service-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="service-order-modal-header">
          <h5 className="service-order-modal-title">
            <i className="bi bi-pencil-square"></i>
            Editar Produto
          </h5>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="service-order-modal-body">
          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="grid gap-4 py-4 px-6">
              {/* Código da Peça e Nome */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      type="text"
                      id="partNumber"
                      className={`mb-input ${form.partNumber ? "filled" : ""}`}
                      placeholder=""
                      value={form.partNumber}
                      onChange={(e) => setForm((f) => ({ ...f, partNumber: e.target.value }))}
                      style={{
                        borderColor: form.partNumber ? "#dc3545" : "#fca5a5",
                        minHeight: "56px",
                      }}
                    />
                    <label htmlFor="partNumber" className={`mb-input-label ${form.partNumber ? "shrunken" : ""}`}>
                      Código da Peça *
                    </label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      type="text"
                      id="nome"
                      className={`mb-input ${form.nome ? "filled" : ""}`}
                      placeholder=""
                      value={form.nome}
                      onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                      style={{
                        borderColor: form.nome ? "#dc3545" : "#fca5a5",
                        minHeight: "56px",
                      }}
                    />
                    <label htmlFor="nome" className={`mb-input-label ${form.nome ? "shrunken" : ""}`}>
                      Nome *
                    </label>
                  </div>
                </div>
              </div>

              {/* Categoria e Fornecedor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <div ref={categoriaDropdownRef} style={{ position: "relative" }}>
                      <button
                        type="button"
                        className={`mb-input select ${!form.categoria ? "placeholder" : ""}`}
                        onClick={() => setCategoriaDropdownOpen(!categoriaDropdownOpen)}
                        style={{
                          textAlign: "left",
                          cursor: "pointer",
                          borderColor: form.categoria ? "#dc3545" : "#fca5a5",
                          minHeight: "56px",
                        }}
                      >
                        {form.categoria || ""}
                      </button>
                      <label className={`mb-input-label ${form.categoria ? "shrunken" : ""}`}>
                        Categoria *
                      </label>
                      <span className="mb-select-caret">▼</span>

                      {categoriaDropdownOpen && (
                        <ul className="mb-select-menu">
                          {categorias.map((cat) => (
                            <li
                              key={cat}
                              className="mb-select-item"
                              onClick={() => {
                                setForm((f) => ({ ...f, categoria: cat }));
                                setCategoriaDropdownOpen(false);
                              }}
                            >
                              {cat}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      type="text"
                      id="fornecedor"
                      className={`mb-input ${form.fornecedor ? "filled" : ""}`}
                      placeholder=""
                      value={form.fornecedor}
                      onChange={(e) => setForm((f) => ({ ...f, fornecedor: e.target.value }))}
                      style={{
                        borderColor: form.fornecedor ? "#dc3545" : "#fca5a5",
                        minHeight: "56px",
                      }}
                    />
                    <label htmlFor="fornecedor" className={`mb-input-label ${form.fornecedor ? "shrunken" : ""}`}>
                      Fornecedor *
                    </label>
                  </div>
                </div>
              </div>

              {/* Quantidade, Quantidade Reservada e Estoque Mínimo */}
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      type="number"
                      id="quantidade"
                      className={`mb-input ${form.quantidade !== "" ? "filled" : ""}`}
                      placeholder=""
                      value={form.quantidade}
                      onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value ? Number(e.target.value) : "" }))}
                      min="0"
                      style={{
                        borderColor: form.quantidade !== "" ? "#dc3545" : "#fca5a5",
                        minHeight: "56px",
                      }}
                    />
                    <label htmlFor="quantidade" className={`mb-input-label ${form.quantidade !== "" ? "shrunken" : ""}`}>
                      Quantidade *
                    </label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      type="number"
                      id="reserveQuantity"
                      className={`mb-input ${form.reserveQuantity !== "" ? "filled" : ""}`}
                      placeholder=""
                      value={form.reserveQuantity}
                      onChange={(e) => setForm((f) => ({ ...f, reserveQuantity: e.target.value ? Number(e.target.value) : "" }))}
                      min="0"
                      style={{
                        borderColor: form.reserveQuantity !== "" ? "#dc3545" : "#fca5a5",
                        minHeight: "56px",
                      }}
                    />
                    <label htmlFor="reserveQuantity" className={`mb-input-label ${form.reserveQuantity !== "" ? "shrunken" : ""}`}>
                      Qtd. Reservada
                    </label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      type="number"
                      id="minimumStock"
                      className={`mb-input ${form.minimumStock !== "" ? "filled" : ""}`}
                      placeholder=""
                      value={form.minimumStock}
                      onChange={(e) => setForm((f) => ({ ...f, minimumStock: e.target.value ? Number(e.target.value) : "" }))}
                      min="0"
                      style={{
                        borderColor: form.minimumStock !== "" ? "#dc3545" : "#fca5a5",
                        minHeight: "56px",
                      }}
                    />
                    <label htmlFor="minimumStock" className={`mb-input-label ${form.minimumStock !== "" ? "shrunken" : ""}`}>
                      Estoque Mínimo *
                    </label>
                  </div>
                </div>
              </div>

              {/* Custo e Preço de Venda */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      type="number"
                      id="costValue"
                      className={`mb-input ${form.costValue !== "" ? "filled" : ""}`}
                      placeholder=""
                      value={form.costValue}
                      onChange={(e) => setForm((f) => ({ ...f, costValue: e.target.value ? Number(e.target.value) : "" }))}
                      step="0.01"
                      min="0"
                      style={{
                        borderColor: form.costValue !== "" ? "#dc3545" : "#fca5a5",
                        minHeight: "56px",
                      }}
                    />
                    <label htmlFor="costValue" className={`mb-input-label ${form.costValue !== "" ? "shrunken" : ""}`}>
                      Custo (€) *
                    </label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      type="number"
                      id="preco"
                      className={`mb-input ${form.preco !== "" ? "filled" : ""}`}
                      placeholder=""
                      value={form.preco}
                      onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value ? Number(e.target.value) : "" }))}
                      step="0.01"
                      min="0"
                      style={{
                        borderColor: form.preco !== "" ? "#dc3545" : "#fca5a5",
                        minHeight: "56px",
                      }}
                    />
                    <label htmlFor="preco" className={`mb-input-label ${form.preco !== "" ? "shrunken" : ""}`}>
                      Preço de Venda (€) *
                    </label>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="grid gap-2">
                <div className="mb-input-wrapper">
                  <textarea
                    id="descricao"
                    className={`mb-input textarea ${form.descricao ? "filled" : ""}`}
                    rows={2}
                    placeholder=""
                    value={form.descricao}
                    onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                    onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.nextElementSibling?.classList.remove("shrunken");
                      }
                    }}
                    style={{
                      borderColor: form.descricao ? "#dc3545" : "#fca5a5",
                      minHeight: "80px",
                    }}
                  />
                  <label htmlFor="descricao" className={`mb-input-label ${form.descricao ? "shrunken" : ""}`}>
                    Descrição *
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="service-order-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={submitting}
              >
                {submitting ? "A atualizar..." : "Atualizar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
