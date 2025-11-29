import React from "react";
import { useAddPartsModal } from "../hooks/useAddPartsModal";
import "../styles/AddPartsModal.css";

interface AddPartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

const AddPartsModal: React.FC<AddPartsModalProps> = ({ isOpen, onClose, orderId, onSuccess }) => {
  const {
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
  } = useAddPartsModal(isOpen, orderId, onSuccess, onClose);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Adicionar Peça</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="search-section">
            <input
              type="text"
              className="modal-search-input"
              placeholder="Pesquisar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="modal-loading">Carregando produtos...</div>
          ) : (
            <>
              <div className="products-list">
                {filteredProducts.length === 0 ? (
                  <div className="no-products">Nenhum produto encontrado</div>
                ) : (
                  filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className={`product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="product-info">
                        <div className="product-name">{product.name}</div>
                          {product.partNumber && <div className="product-sku">Código: {product.partNumber}</div>}                      </div>
                        <div className="product-details">
                        <div className="product-stock">
                          Stock: <strong>{product.quantity}</strong>
                        </div>
                      <div className="product-price">€ {product.saleValue.toFixed(2)}</div>                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedProduct && (
                <div className="quantity-section">
                  <label>Quantidade:</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="quantity-input"
                  />
                  <span className="stock-info">/ {selectedProduct.quantity} disponíveis</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAddPart}
            disabled={!selectedProduct || adding}
          >
            {adding ? "Adicionando..." : "Adicionar Peça"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPartsModal;