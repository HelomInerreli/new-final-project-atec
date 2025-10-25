import React, { useId, useState, type ChangeEvent } from "react";
import "./inputs.css";

interface SelectProps {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  className?: string;
}

export default function Select({
  label,
  options,
  value: controlledValue,
  onChange,
  name,
  className = "",
}: SelectProps) {
  const id = useId();
  const [value, setValue] = useState<string>(controlledValue ?? "");
  const isControlled = typeof controlledValue !== "undefined";
  const finalValue = isControlled ? (controlledValue as string) : value;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!isControlled) setValue(e.target.value);
    onChange?.(e);
  };

  return (
    <div
      className={`mb-input-wrapper ${className}`}
      style={{ position: "relative" }}
    >
      <select
        id={id}
        name={name}
        className={`mb-input select ${finalValue === "" ? "placeholder" : ""}`}
        value={finalValue}
        onChange={handleChange}
        aria-label={label}
      >
        {/* show visible placeholder option so the control displays text before selection */}
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* custom caret element to ensure visible dropdown indicator across browsers */}
      <span className="mb-select-caret" aria-hidden>
        ▾
      </span>

      {/* For selects we keep the label shrunken to avoid overlapping the selected option/placeholder */}
      <label htmlFor={id} className={`mb-input-label shrunken`}>
        {label}
      </label>
    </div>
  );
}
