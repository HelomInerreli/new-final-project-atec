import React from "react";
import { useAddPartsModal } from "../hooks/useAddPartsModal";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import "../styles/AddPartsModal.css";
import { type AddPartsModalProps } from "../interfaces/ModalParts";

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
    quantityError,
  } = useAddPartsModal(isOpen, orderId, onSuccess, onClose);

  if (!isOpen) return null;

  return (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div className="comment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-header">
          <h3>Adicionar Peça</h3>
          <button className="comment-modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="comment-modal-body">
          <input
            type="text"
            className="modal-search-input"
            placeholder="Pesquisar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

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
                        {product.partNumber && <div className="product-sku">Código: {product.partNumber}</div>}
                      </div>
                      <div className="product-details">
                        <div className="product-stock">
                          Stock: <strong>{product.quantity}</strong>
                        </div>
                        <div className="product-price">€ {product.saleValue.toFixed(2)}</div>
                      </div>
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
                    className={`quantity-input ${quantityError ? 'error' : ''}`}
                  />
                  <span className="stock-info">/ {selectedProduct.quantity} disponíveis</span>
                  {quantityError && <div className="quantity-error">{quantityError}</div>}
                </div>
              )}
            </>
          )}
        </div>

        <div className="comment-modal-footer">
          <Button 
            variant="outline" 
            onClick={onClose}
            type="button"
          >
            Cancelar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={!selectedProduct || adding || !!quantityError}
                type="button"
              >
                {adding ? "Adicionando..." : "Adicionar Peça"}
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Adição de Peça</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja adicionar esta peça à ordem #{orderId}?
                  
                  {selectedProduct && (
                    <div className="confirmation-details">
                      <div className="detail-row">
                        <strong>Peça:</strong> {selectedProduct.name}
                      </div>
                      {selectedProduct.partNumber && (
                        <div className="detail-row">
                          <strong>Código:</strong> {selectedProduct.partNumber}
                        </div>
                      )}
                      <div className="detail-row">
                        <strong>Quantidade:</strong> {quantity} un.
                      </div>
                      <div className="detail-row">
                        <strong>Preço unitário:</strong> €{selectedProduct.saleValue.toFixed(2)}
                      </div>
                      <div className="detail-total">
                        <strong>Total:</strong> €{(selectedProduct.saleValue * quantity).toFixed(2)}
                      </div>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddPart}>
                  Sim, Adicionar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default AddPartsModal;