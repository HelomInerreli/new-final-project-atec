import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import "../../styles/CreateServiceOrderModal.css";
import "../inputs.css";

type EmployeeOpt = { id: string; name: string };

interface VacationCreateDialogProps {
  employees: EmployeeOpt[];
  onConfirm: (data: { employeeId: string; startDate: Date; endDate: Date }) => void | Promise<void>;
  triggerLabel?: string;
}

export default function VacationCreateDialog({
  employees,
  onConfirm,
  triggerLabel = "Marcar Férias",
}: VacationCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
        setEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirm = async () => {
    if (!selectedUsuario || !startDate || !endDate) {
      toast.error("Preencha todos os campos");
      return;
    }
    await onConfirm({ 
      employeeId: selectedUsuario, 
      startDate: new Date(startDate), 
      endDate: new Date(endDate) 
    });
    setSelectedUsuario("");
    setStartDate("");
    setEndDate("");
    setOpen(false);
    toast.success("Férias marcadas com sucesso!");
  };

  const selectedEmployee = employees.find(e => e.id === selectedUsuario);

  if (!open) return (
    <Button variant="destructive" onClick={() => setOpen(true)}>
      <Calendar className="mr-2 h-4 w-4" />
      {triggerLabel}
    </Button>
  );

  return (
    <div className="service-order-modal-overlay" onClick={() => setOpen(false)}>
      <div className="service-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="service-order-modal-header">
          <h5 className="service-order-modal-title">
            <i className="bi bi-calendar-check"></i>
            Marcar Férias
          </h5>
          <button type="button" className="modal-close-btn" onClick={() => setOpen(false)} aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="service-order-modal-body">
          <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
            <div className="grid gap-4 py-4 px-6">
              {/* Colaborador */}
              <div className="grid gap-2">
                <div className="mb-input-wrapper">
                  <div ref={employeeDropdownRef} style={{ position: "relative" }}>
                    <button
                      type="button"
                      className={`mb-input select ${!selectedUsuario ? "placeholder" : ""}`}
                      onClick={() => setEmployeeDropdownOpen(!employeeDropdownOpen)}
                      style={{
                        textAlign: "left",
                        cursor: "pointer",
                        minHeight: "56px",
                      }}
                    >
                      {selectedEmployee ? selectedEmployee.name : ""}
                    </button>
                    <label className={`mb-input-label ${selectedUsuario ? "shrunken" : ""}`}>
                      Colaborador *
                    </label>
                    <span className="mb-select-caret">▼</span>

                    {employeeDropdownOpen && (
                      <ul className="mb-select-menu">
                        {employees.map((employee) => (
                          <li
                            key={employee.id}
                            className={`mb-select-item ${selectedUsuario === employee.id ? "selected" : ""}`}
                            onClick={() => {
                              setSelectedUsuario(employee.id);
                              setEmployeeDropdownOpen(false);
                            }}
                          >
                            {employee.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Início e Data Fim */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="mb-input-wrapper" style={{ position: "relative" }}>
                    <input
                      id="start_date"
                      type="date"
                      className={`mb-input date-input ${startDate ? "has-value" : ""}`}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
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
                      style={{ minHeight: "56px", paddingRight: "40px", borderColor: "#fca5a5" }}
                    />
                    <label className={`mb-input-label ${startDate ? "shrunken" : ""}`}>
                      Data de Início *
                    </label>
                    <Calendar
                      onClick={() => {
                        const input = document.getElementById("start_date") as HTMLInputElement;
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
                      id="end_date"
                      type="date"
                      className={`mb-input date-input ${endDate ? "has-value" : ""}`}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
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
                      style={{ minHeight: "56px", paddingRight: "40px", borderColor: "#fca5a5" }}
                    />
                    <label className={`mb-input-label ${endDate ? "shrunken" : ""}`}>
                      Data de Fim *
                    </label>
                    <Calendar
                      onClick={() => {
                        const input = document.getElementById("end_date") as HTMLInputElement;
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
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="service-order-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={!selectedUsuario || !startDate || !endDate}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}