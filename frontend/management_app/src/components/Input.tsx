import React, { useId, useState, type ChangeEvent } from "react";
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
        className="mb-input"
        type={type === "password" && showPassword ? "text" : type}
        value={finalValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={type === "date" ? placeholder : focused ? placeholder : ""}
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
