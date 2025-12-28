import React from "react";
import { useAddPartsModal } from "../hooks/useAddPartsModal";
import { Button } from "./ui/button";
import { toast } from "../hooks/use-toast";
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
                    className="quantity-input"
                  />
                  <span className="stock-info">/ {selectedProduct.quantity} disponíveis</span>
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
                disabled={!selectedProduct || adding}
                type="button"
              >
                {adding ? "Adicionando..." : "Adicionar Peça"}
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader className="space-y-4">
                <AlertDialogTitle className="text-xl">Confirmar Adição de Peça</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Tem certeza que deseja adicionar esta peça à ordem <span className="font-semibold text-red-600">#{orderId}</span>?
                  
                  {selectedProduct && (
                    <div className="mt-4 p-4 bg-gray-50 border-l-4 border-red-500 rounded-r-lg space-y-2">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Peça:</span>
                        <span className="text-gray-800 ml-2">{selectedProduct.name}</span>
                      </div>
                      {selectedProduct.partNumber && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Código:</span>
                          <span className="text-gray-800 ml-2">{selectedProduct.partNumber}</span>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Quantidade:</span>
                        <span className="text-gray-800 ml-2">{quantity} un.</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Preço unitário:</span>
                        <span className="text-gray-800 ml-2">€{selectedProduct.saleValue.toFixed(2)}</span>
                      </div>
                      <div className="text-base font-bold text-red-600 pt-2 border-t-2 border-gray-300 mt-2">
                        <span>Total:</span>
                        <span className="ml-2">€{(selectedProduct.saleValue * quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter className="flex flex-row justify-center items-center gap-3 sm:flex-row sm:justify-center">
                <AlertDialogCancel className="hover:bg-gray-100 m-0">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleAddPart}
                  className="bg-red-600 hover:bg-red-700 m-0"
                >
                  Adicionar
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