import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Calendar, Plus } from "lucide-react";
import { toast } from "sonner";
import "../../styles/CreateServiceOrderModal.css";
import "../inputs.css";

type EmployeeOpt = { id: string; name: string };

interface DayOffCreateDialogProps {
  employees: EmployeeOpt[];
  onConfirm: (data: { employeeId: string; date: Date; reason: string }) => void | Promise<void>;
  triggerLabel?: string;
}

export default function DayOffCreateDialog({
  employees,
  onConfirm,
  triggerLabel = "Marcar Folga",
}: DayOffCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [motivo, setMotivo] = useState("");
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
    if (!selectedUsuario || !selectedDate || !motivo) {
      toast.error("Preencha todos os campos");
      return;
    }
    await onConfirm({ employeeId: selectedUsuario, date: new Date(selectedDate), reason: motivo });
    setSelectedUsuario("");
    setSelectedDate("");
    setMotivo("");
    setOpen(false);
    toast.success("Folga marcada com sucesso!");
  };

  const selectedEmployee = employees.find(e => e.id === selectedUsuario);

  if (!open) return (
    <Button variant="destructive" onClick={() => setOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      {triggerLabel}
    </Button>
  );

  return (
    <div className="service-order-modal-overlay" onClick={() => setOpen(false)}>
      <div className="service-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="service-order-modal-header">
          <h5 className="service-order-modal-title">
            <i className="bi bi-calendar-x"></i>
            Marcar Folga
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

              {/* Data */}
              <div className="grid gap-2">
                <div className="mb-input-wrapper" style={{ position: "relative" }}>
                  <input
                    id="day_off_date"
                    type="date"
                    className={`mb-input date-input ${selectedDate ? "has-value" : ""}`}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
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
                  <label className={`mb-input-label ${selectedDate ? "shrunken" : ""}`}>
                    Data *
                  </label>
                  <Calendar
                    onClick={() => {
                      const input = document.getElementById("day_off_date") as HTMLInputElement;
                      if (input) input.showPicker();
                    }}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "20px",
                      height: "20px",
                      color: "#6b7280",
                      cursor: "pointer",
                      pointerEvents: "auto",
                    }}
                  />
                </div>
              </div>

              {/* Motivo */}
              <div className="grid gap-2">
                <div className="mb-input-wrapper">
                  <textarea
                    className={`mb-input ${motivo ? "has-value" : ""}`}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    style={{ minHeight: "80px", resize: "none", borderColor: "#f87171" }}
                  />
                  <label className={`mb-input-label ${motivo ? "shrunken" : ""}`}>
                    Motivo *
                  </label>
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
            disabled={!selectedUsuario || !selectedDate || !motivo}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}