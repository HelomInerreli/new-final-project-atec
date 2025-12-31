import { type FC, useState, useRef, useEffect } from "react";
import { useEditServiceModal } from "../hooks/useEditServiceModal";
import { type Service } from "../services/serviceService";
import "../styles/CreateServiceOrderModal.css";
import "./inputs.css";

interface EditServiceModalProps {
  show: boolean;
  service: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditServiceModal: FC<EditServiceModalProps> = ({ show, service, onClose, onSuccess }) => {
  const {
    form,
    setForm,
    submitting,
    error,
    handleSubmit,
    handleClose,
  } = useEditServiceModal(show, service, onSuccess, onClose);

  if (!show || !service) return null;

  return (
    <div className="service-order-modal-overlay" onClick={handleClose}>
      <div className="service-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="service-order-modal-header">
          <h5 className="service-order-modal-title">
            <i className="bi bi-pencil"></i>
            Editar Serviço
          </h5>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="service-order-modal-body">
          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="grid gap-4 py-4 px-6">
              {/* Nome do Serviço */}
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
                    style={{ minHeight: "56px" }}
                  />
                  <label className={`mb-input-label ${form.name ? "shrunken" : ""}`}>
                    Nome do Serviço *
                  </label>
                </div>
              </div>

              {/* Descrição */}
              <div className="grid gap-2">
                <div className="mb-input-wrapper">
                  <textarea
                    id="description"
                    placeholder=""
                    className={`mb-input textarea ${form.description ? "filled" : ""}`}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    onFocus={(e) => e.target.nextElementSibling?.classList.add("shrunken")}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.nextElementSibling?.classList.remove("shrunken");
                      }
                    }}
                    rows={3}
                    style={{ minHeight: "80px" }}
                  />
                  <label className={`mb-input-label ${form.description ? "shrunken" : ""}`}>
                    Descrição
                  </label>
                </div>
              </div>

              {/* Preço e Duração */}
              <div className="grid grid-cols-2 gap-4">
                {/* Preço */}
                <div className="grid gap-2">
                  <PriceInput 
                    value={form.price}
                    onChange={(value) => setForm((f) => ({ ...f, price: value }))}
                  />
                </div>

                {/* Duração */}
                <div className="grid gap-2">
                  <DurationSelect 
                    value={form.duration_minutes}
                    onChange={(value) => setForm((f) => ({ ...f, duration_minutes: value }))}
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Serviço Ativo
                  </label>
                </div>
              </div>
            </div>

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
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "A atualizar..." : "Atualizar Serviço"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente separado para o campo de Preço
const PriceInput: FC<{ value: number | ""; onChange: (value: number | "") => void }> = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mb-input-wrapper" style={{ position: 'relative' }}>
      <input
        type="number"
        step="0.01"
        min="0"
        placeholder=""
        className="mb-input"
        value={value === "" ? "" : value}
        onChange={(e) => {
          const val = e.target.value;
          if (val === '') {
            onChange("");
          } else {
            const numValue = parseFloat(val);
            onChange(isNaN(numValue) ? "" : numValue);
          }
        }}
        onFocus={(e) => {
          setIsFocused(true);
          e.target.nextElementSibling?.classList.add('shrunken');
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (!e.target.value) {
            e.target.nextElementSibling?.classList.remove('shrunken');
          }
        }}
      />
      <div style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }}>
        <button
          type="button"
          onClick={() => {
            const currentValue = value === "" ? 0 : value;
            onChange(currentValue + 5);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6b7280',
            padding: '0',
            lineHeight: 1,
            height: '12px'
          }}
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => {
            const currentValue = value === "" ? 0 : value;
            const newValue = currentValue - 5;
            onChange(newValue >= 0 ? newValue : 0);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6b7280',
            padding: '0',
            lineHeight: 1,
            height: '12px'
          }}
        >
          ▼
        </button>
      </div>
      <label className={`mb-input-label ${(value !== "" && !isNaN(Number(value))) || isFocused ? 'shrunken' : ''}`}>
        Preço (€) *
      </label>
    </div>
  );
};

// Componente separado para o campo de Duração
const DurationSelect: FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const durations = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240];

  const formatDuration = (minutes: number) => {
    return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60 > 0 ? `${minutes % 60}min` : ''}`.trim();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="mb-input-wrapper" ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`mb-input select ${!value && !isFocused ? 'placeholder' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ textAlign: 'left', cursor: 'pointer' }}
      >
        {value ? formatDuration(value) : ''}
      </button>
      <label className={`mb-input-label ${value || isFocused ? 'shrunken' : ''}`}>
        Duração (min) *
      </label>
      <span className="mb-select-caret">▼</span>
      
      {isOpen && (
        <ul className="mb-select-menu" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {durations.map((minutes) => (
            <li
              key={minutes}
              className={`mb-select-item ${value === minutes ? 'selected' : ''}`}
              onClick={() => {
                onChange(minutes);
                setIsOpen(false);
              }}
            >
              {formatDuration(minutes)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EditServiceModal;
