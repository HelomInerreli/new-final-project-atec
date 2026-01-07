import React, { useId, useState, useRef, useEffect } from "react";
import "./inputs.css";

// Interface para opção do select
interface Option {
  value: string;
  label: string;
}

// Interface para props do componente Select
interface SelectProps {
  label: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  className?: string;
}

// Componente Select personalizado
export default function Select({
  label,
  options,
  value: controlledValue,
  onChange,
  name,
  className = "",
}: SelectProps) {
  const id = useId();
  // Estados do componente
  const [value, setValue] = useState<string>(controlledValue ?? "");
  const isControlled = typeof controlledValue !== "undefined";
  const finalValue = isControlled ? (controlledValue as string) : value;
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Sincroniza valor controlado
  useEffect(() => {
    if (isControlled) setValue(controlledValue as string);
  }, [controlledValue, isControlled]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const hasValue = finalValue !== undefined && finalValue !== "";

  // Manipula seleção de opção
  function handleSelect(val: string) {
    if (!isControlled) setValue(val);
    onChange?.(val);
    setOpen(false);
  }

  // Alterna abertura do dropdown
  function toggleOpen() {
    setOpen((s) => !s);
  }

  // Renderização do componente
  return (
    <div
      ref={ref}
      className={`mb-input-wrapper mb-custom-select ${className}`}
      style={{ position: "relative" }}
    >
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`mb-input select mb-select-button ${
          hasValue ? "has-value" : "placeholder"
        }`}
        onClick={toggleOpen}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <span className={`mb-select-value ${!hasValue ? "placeholder" : ""}`}>
          {hasValue
            ? options.find((o) => o.value === finalValue)?.label ?? finalValue
            : label}
        </span>
        <span className="mb-select-caret" aria-hidden>
          {/* SVG caret to avoid encoding issues */}
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M1 1l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <ul
          className="mb-select-menu"
          role="listbox"
          aria-labelledby={id}
          tabIndex={-1}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === finalValue}
              className={`mb-select-item ${
                opt.value === finalValue ? "selected" : ""
              }`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      <label
        htmlFor={id}
        className={`mb-input-label ${
          hasValue || focused ? "shrunken" : "hidden"
        }`}
      >
        {label}
      </label>
    </div>
  );
}
