import { type FC, useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
import { useEditEmployeeModal, type EmployeeFormData } from "../hooks/useEditEmployeeModal";
import "../styles/CreateServiceOrderModal.css";
import "./inputs.css";

interface EditEmployeeModalProps {
  show: boolean;
  employeeId: number;
  initialData: EmployeeFormData;
  onClose: () => void;
  onSuccess: () => void;
}

const EditEmployeeModal: FC<EditEmployeeModalProps> = ({ show, employeeId, initialData, onClose, onSuccess }) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const {
    form,
    setForm,
    roles,
    loading,
    submitting,
    error,
    handleSubmit,
    handleClose,
  } = useEditEmployeeModal({ employeeId, initialData, onSuccess, onClose });

  const selectedRole = roles.find((r) => r.id.toString() === form.role_id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
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
            <i className="bi bi-pencil"></i>
            Editar Funcionário
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
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p className="loading-text">A carregar dados...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="grid gap-4 py-4 px-6">
                  {/* Nome e Apelido */}
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
                          style={{ minHeight: "56px", borderColor: "#f87171" }}
                        />
                        <label className={`mb-input-label ${form.name ? "shrunken" : ""}`}>
                          Nome *
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <input
                          id="last_name"
                          type="text"
                          placeholder=""
                          className={`mb-input ${form.last_name ? "filled" : ""}`}
                          value={form.last_name}
                          onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                          onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.nextElementSibling?.classList.remove("shrunken");
                            }
                          }}
                          style={{ minHeight: "56px", borderColor: "#f87171" }}
                        />
                        <label className={`mb-input-label ${form.last_name ? "shrunken" : ""}`}>
                          Apelido *
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
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
                        style={{ minHeight: "56px", borderColor: "#f87171" }}
                      />
                      <label className={`mb-input-label ${form.email ? "shrunken" : ""}`}>
                        Email *
                      </label>
                    </div>
                  </div>

                  {/* Telefone e Salário */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <input
                          id="phone"
                          type="text"
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
                          style={{ minHeight: "56px", borderColor: "#f87171" }}
                        />
                        <label className={`mb-input-label ${form.phone ? "shrunken" : ""}`}>
                          Telefone *
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="mb-input-wrapper">
                        <input
                          id="salary"
                          type="number"
                          placeholder=""
                          className={`mb-input ${form.salary !== "" ? "filled" : ""}`}
                          value={form.salary}
                          onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
                          onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.nextElementSibling?.classList.remove("shrunken");
                            }
                          }}
                          step="0.01"
                          min="0"
                          style={{ minHeight: "56px", borderColor: "#f87171" }}
                        />
                        <label className={`mb-input-label ${form.salary !== "" ? "shrunken" : ""}`}>
                          Salário (€) *
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
                        style={{ minHeight: "56px", borderColor: "#f87171" }}
                      />
                      <label className={`mb-input-label ${form.address ? "shrunken" : ""}`}>
                        Morada *
                      </label>
                    </div>
                  </div>

                  {/* Data de Nascimento e Data de Contratação */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <div className="mb-input-wrapper" style={{ position: "relative" }}>
                        <input
                          id="date_of_birth"
                          type="date"
                          className={`mb-input date-input ${form.date_of_birth ? "has-value" : ""}`}
                          value={form.date_of_birth}
                          onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                          onFocus={(e) => {
                            const label = e.target.nextElementSibling;
                            if (label) label.classList.add("shrunken");
                          }}
                          onBlur={(e) => {
                            const label = e.target.nextElementSibling;
                            if (!e.target.value && label) {
                              label.classList.remove("shrunken");
                            }
                          }}
                          style={{ minHeight: "56px", paddingRight: "40px", borderColor: "#f87171" }}
                        />
                        <label className={`mb-input-label ${form.date_of_birth ? "shrunken" : ""}`}>
                          Data de Nascimento *
                        </label>
                        <Calendar
                          onClick={() => {
                            const input = document.getElementById("date_of_birth") as HTMLInputElement;
                            if (input) {
                              input.showPicker?.();
                              input.focus();
                            }
                          }}
                          style={{
                            position: "absolute",
                            right: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "20px",
                            height: "20px",
                            color: "#6b7280",
                            cursor: "pointer",
                            pointerEvents: "all",
                            zIndex: 1
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="mb-input-wrapper" style={{ position: "relative" }}>
                        <input
                          id="hired_at"
                          type="date"
                          className={`mb-input date-input ${form.hired_at ? "has-value" : ""}`}
                          value={form.hired_at}
                          onChange={(e) => setForm((f) => ({ ...f, hired_at: e.target.value }))}
                          onFocus={(e) => {
                            const label = e.target.nextElementSibling;
                            if (label) label.classList.add("shrunken");
                          }}
                          onBlur={(e) => {
                            const label = e.target.nextElementSibling;
                            if (!e.target.value && label) {
                              label.classList.remove("shrunken");
                            }
                          }}
                          style={{ minHeight: "56px", paddingRight: "40px", borderColor: "#f87171" }}
                        />
                        <label className={`mb-input-label ${form.hired_at ? "shrunken" : ""}`}>
                          Data de Contratação *
                        </label>
                        <Calendar
                          onClick={() => {
                            const input = document.getElementById("hired_at") as HTMLInputElement;
                            if (input) {
                              input.showPicker?.();
                              input.focus();
                            }
                          }}
                          style={{
                            position: "absolute",
                            right: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "20px",
                            height: "20px",
                            color: "#6b7280",
                            cursor: "pointer",
                            pointerEvents: "all",
                            zIndex: 1
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Função */}
                  <div className="grid gap-2">
                    <div className="mb-input-wrapper">
                      <div ref={roleDropdownRef} style={{ position: "relative" }}>
                        <button
                          type="button"
                          className={`mb-input select ${!form.role_id ? "placeholder" : ""}`}
                          onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                          style={{
                            textAlign: "left",
                            cursor: "pointer",
                            minHeight: "56px",
                          }}
                        >
                          {selectedRole ? selectedRole.name : ""}
                        </button>
                        <label className={`mb-input-label ${form.role_id ? "shrunken" : ""}`}>
                          Função *
                        </label>
                        <span className="mb-select-caret">▼</span>

                        {roleDropdownOpen && (
                          <ul className="mb-select-menu">
                            {roles.map((role) => (
                              <li
                                key={role.id}
                                className={`mb-select-item ${form.role_id === role.id.toString() ? "selected" : ""}`}
                                onClick={() => {
                                  setForm((f) => ({ ...f, role_id: role.id.toString() }));
                                  setRoleDropdownOpen(false);
                                }}
                              >
                                {role.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}
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
            type="button"
            className="btn btn-danger"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !form.name ||
              !form.last_name ||
              !form.email ||
              !form.phone ||
              !form.address ||
              !form.date_of_birth ||
              form.salary === "" ||
              !form.hired_at ||
              !form.role_id
            }
          >
            {submitting ? "A atualizar..." : "Atualizar Funcionário"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;

