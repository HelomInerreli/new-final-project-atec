/**
 * Interface para representação básica de um utilizador
 * Contém informações essenciais de identificação e contacto
 * Utilizada para dados simplificados de utilizador na aplicação cliente
 */
export interface User {
  /** ID único do utilizador */
  id: number;
  /** Nome completo do utilizador */
  name: string;
  /** Endereço de email do utilizador */
  email: string;
}
