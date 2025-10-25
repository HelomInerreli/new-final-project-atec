import React, { useId, useState, type ChangeEvent } from "react";
import "./inputs.css";

interface TextAreaProps {
  label: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  name?: string;
  rows?: number;
  className?: string;
}

export default function TextArea({
  label,
  value: controlledValue,
  onChange,
  name,
  rows = 4,
  className = "",
}: TextAreaProps) {
  const id = useId();
  const [value, setValue] = useState<string>(controlledValue ?? "");
  const isControlled = typeof controlledValue !== "undefined";
  const [focused, setFocused] = useState(false);

  const finalValue = isControlled ? (controlledValue as string) : value;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setValue(e.target.value);
    onChange?.(e);
  };

  const hasValue = finalValue !== undefined && finalValue !== "";

  return (
    <div
      className={`mb-input-wrapper ${className}`}
      style={{ position: "relative" }}
    >
      <textarea
        id={id}
        name={name}
        className={`mb-input textarea`}
        rows={rows}
        value={finalValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? label : ""}
        aria-label={label}
      />

      <label
        htmlFor={id}
        className={`mb-input-label ${hasValue || focused ? "shrunken" : ""}`}
      >
        {label}
      </label>

      {/* Textarea uses shared CSS; we add textarea-specific class via className below */}
    </div>
  );
}
