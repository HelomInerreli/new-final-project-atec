import React, { useState, useEffect } from "react";
import { getProducts, addPartToOrder, type Product } from "../services/productService";
import "../styles/AddPartsModal.css";

interface AddPartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

const AddPartsModal: React.FC<AddPartsModalProps> = ({ isOpen, onClose, orderId, onSuccess }) => {
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
      setSelectedProduct(null);
      setQuantity(1);
      setSearch("");
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAdding(false);
    }
  };

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
                        {product.sku && <div className="product-sku">Código: {product.sku}</div>}
                      </div>
                      <div className="product-details">
                        <div className="product-stock">
                          Stock: <strong>{product.quantity}</strong>
                        </div>
                        <div className="product-price">€ {product.price.toFixed(2)}</div>
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