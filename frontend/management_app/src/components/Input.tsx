import React, { useId, useState, useRef, type ChangeEvent } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./inputs.css";

interface InputProps {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  passwordToggle?: boolean;
  name?: string;
  className?: string;
}

export default function Input({
  label,
  placeholder = "",
  type = "text",
  value: controlledValue,
  onChange,
  passwordToggle = false,
  name,
  className = "",
}: InputProps) {
  const id = useId();
  const [value, setValue] = useState<string>(controlledValue ?? "");
  const isControlled = typeof controlledValue !== "undefined";
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const finalValue = isControlled ? (controlledValue as string) : value;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setValue(e.target.value);
    onChange?.(e);
  };

  const hasValue = finalValue !== undefined && finalValue !== "";

  return (
    <div
      className={`mb-input-wrapper ${className}`}
      style={{ position: "relative" }}
    >
      <input
        id={id}
        name={name}
        className={`mb-input ${type === "date" ? "date-input" : ""} ${
          finalValue ? "has-value" : ""
        }`}
        type={type === "password" && showPassword ? "text" : type}
        value={finalValue}
        onChange={handleChange}
        ref={inputRef}
        onClick={() => {
          // For date inputs, ensure the native picker opens on first click in supporting browsers.
          if (type === "date" && inputRef.current) {
            // make sure the control is focused so our CSS shows the date fields
            if (document.activeElement !== inputRef.current)
              inputRef.current.focus();
            // call showPicker() when available (Chrome-based browsers)
            const anyEl = inputRef.current as any;
            if (typeof anyEl.showPicker === "function") {
              try {
                anyEl.showPicker();
              } catch (e) {
                // ignore if not supported or fails
              }
            }
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        // show placeholder only when focused (prevents native date hint from showing when idle)
        placeholder={focused ? placeholder : ""}
        aria-label={label}
        autoComplete="off"
      />
      <label
        htmlFor={id}
        className={`mb-input-label ${hasValue || focused ? "shrunken" : ""}`}
      >
        {label}
      </label>

      {passwordToggle && type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          className="mb-input-password-toggle"
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      )}
      {/* styles moved to ./inputs.css */}
    </div>
  );
}
