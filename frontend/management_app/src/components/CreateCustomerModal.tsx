/**
 * Componente modal para criar novo cliente.
 * Permite inserir dados pessoais e de contato.
 */

import { type FC } from "react";
// Importa React
import { Calendar } from "lucide-react";
// Ícone de calendário
import { useCreateCustomerModal } from "../hooks/useCreateCustomerModal";
// Hook personalizado para modal
import "../styles/CreateServiceOrderModal.css";
// Estilos CSS
import "../components/inputs.css";
// Estilos de inputs

// Interface para props do modal
interface CreateCustomerModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Componente funcional para modal de criar cliente
const CreateCustomerModal: FC<CreateCustomerModalProps> = ({ show, onClose, onSuccess }) => {
  // Usa hook personalizado
  const {
    submitting,
    error,
    form,
    setForm,
    handleSubmit,
    handleClose,
  } = useCreateCustomerModal(show, onSuccess, onClose);

  // Não renderiza se não estiver visível
  if (!show) return null;

  // Renderiza modal
  return (
    <div className="service-order-modal-overlay" onClick={handleClose}>
      <div className="service-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="service-order-modal-header">
          <h5 className="service-order-modal-title">
            <i className="bi bi-person-plus"></i>
            Novo Cliente
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
              {/* Nome e Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      id="name"
                      type="text"
                      placeholder=""
                      className={`mb-input ${form.name ? "filled" : ""}`}
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.nextElementSibling?.classList.remove("shrunken");
                        }
                      }}
                      required
                    />
                    <label className={`mb-input-label ${form.name ? "shrunken" : ""}`}>
                      Nome *
                    </label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      id="email"
                      type="email"
                      placeholder=""
                      className={`mb-input ${form.email ? "filled" : ""}`}
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.nextElementSibling?.classList.remove("shrunken");
                        }
                      }}
                      required
                    />
                    <label className={`mb-input-label ${form.email ? "shrunken" : ""}`}>
                      Email *
                    </label>
                  </div>
                </div>
              </div>

              {/* Password e Telefone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      id="password"
                      type="password"
                      placeholder=""
                      className={`mb-input ${form.password ? "filled" : ""}`}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.nextElementSibling?.classList.remove("shrunken");
                        }
                      }}
                      required
                    />
                    <label className={`mb-input-label ${form.password ? "shrunken" : ""}`}>
                      Password *
                    </label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      id="phone"
                      type="tel"
                      placeholder=""
                      className={`mb-input ${form.phone ? "filled" : ""}`}
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.nextElementSibling?.classList.remove("shrunken");
                        }
                      }}
                    />
                    <label className={`mb-input-label ${form.phone ? "shrunken" : ""}`}>
                      Telefone
                    </label>
                  </div>
                </div>
              </div>

              {/* Morada */}
              <div className="grid gap-2">
                <div className="mb-input-wrapper">
                  <input
                    id="address"
                    type="text"
                    placeholder=""
                    className={`mb-input ${form.address ? "filled" : ""}`}
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.nextElementSibling?.classList.remove("shrunken");
                      }
                    }}
                  />
                  <label className={`mb-input-label ${form.address ? "shrunken" : ""}`}>
                    Morada
                  </label>
                </div>
              </div>

              {/* Cidade e Código Postal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      id="city"
                      type="text"
                      placeholder=""
                      className={`mb-input ${form.city ? "filled" : ""}`}
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.nextElementSibling?.classList.remove("shrunken");
                        }
                      }}
                    />
                    <label className={`mb-input-label ${form.city ? "shrunken" : ""}`}>
                      Cidade
                    </label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      id="postal_code"
                      type="text"
                      placeholder=""
                      className={`mb-input ${form.postal_code ? "filled" : ""}`}
                      value={form.postal_code}
                      onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                      onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.nextElementSibling?.classList.remove("shrunken");
                        }
                      }}
                    />
                    <label className={`mb-input-label ${form.postal_code ? "shrunken" : ""}`}>
                      Código Postal
                    </label>
                  </div>
                </div>
              </div>

              {/* País e Data de Nascimento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="mb-input-wrapper">
                    <input
                      id="country"
                      type="text"
                      placeholder=""
                      className={`mb-input ${form.country ? "filled" : ""}`}
                      value={form.country}
                      onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                      onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.nextElementSibling?.classList.remove("shrunken");
                        }
                      }}
                    />
                    <label className={`mb-input-label ${form.country ? "shrunken" : ""}`}>
                      País
                    </label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="mb-input-wrapper" style={{ position: "relative" }}>
                    <input
                      id="birth_date"
                      type="date"
                      className={`mb-input date-input ${form.birth_date ? "has-value filled" : ""}`}
                      value={form.birth_date}
                      onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))}
                      onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.nextElementSibling?.classList.remove("shrunken");
                        }
                      }}
                    />
                    <label className={`mb-input-label ${form.birth_date ? "shrunken" : ""}`}>
                      Data de Nascimento
                    </label>
                    <Calendar
                      size={20}
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6b7280",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const element = document.getElementById("birth_date") as HTMLInputElement;
                        element?.showPicker?.();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="service-order-modal-footer">
          <button type="button" className="btn btn-outline-secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleSubmit}
            disabled={!form.name || !form.email || !form.password || submitting}
          >
            {submitting ? (
              <>
                <div className="spinner-border spinner-border-sm"></div>
                A criar...
              </>
            ) : (
              "Criar Cliente"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Exporta componente padrão
export default CreateCustomerModal;
