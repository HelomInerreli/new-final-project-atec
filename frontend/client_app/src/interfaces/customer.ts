/**
 * Interface para representação de dados de um cliente
 * Contém informações básicas de cadastro e contacto do cliente
 * Utilizada para operações de leitura e exibição de dados do cliente
 */
export interface Customer {
  /** ID único do cliente */
  id: number;
  /** Nome completo do cliente */
  name: string;
  /** Endereço de email do cliente */
  email: string;
  /** Número de telefone/telemóvel do cliente */
  phone: string;
  /** Morada completa do cliente */
  address: string;
  /** Idade do cliente */
  age: number;
}
