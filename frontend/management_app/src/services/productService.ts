const API_URL = "http://localhost:8000/api/v1";

export interface Product {
  id: number;
  name: string;
  partNumber: string;
  description?: string;
  quantity: number;
  saleValue: number;
  category?: string;
  brand?: string;
  price: number;
  sku: string;
}

export const getProducts = async (search?: string): Promise<Product[]> => {
  const url = search 
    ? `${API_URL}/products?search=${encodeURIComponent(search)}`
    : `${API_URL}/products`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erro ao carregar produtos");
  
  const data = await response.json();
  

  return data.map((p: any) => ({
    ...p,
    price: p.saleValue,     
    sku: p.partNumber       
  }));
};

export const addPartToOrder = async (orderId: string, productId: number, quantity: number) => {
  const response = await fetch(`${API_URL}/appointments/${orderId}/parts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erro ao adicionar peça");
  }
  
  return response.json();
};