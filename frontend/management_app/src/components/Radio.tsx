import React, { useId, type ChangeEvent } from "react";
import "./inputs.css";

interface RadioProps {
  label: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function Radio({
  label,
  name,
  value,
  checked,
  onChange,
  className = "",
}: RadioProps) {
  const id = useId();

  return (
    <div className={`mb-input-wrapper ${className} mb-radio`}>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ width: 18, height: 18, accentColor: "#dc3545" }}
      />
      <label htmlFor={id} style={{ userSelect: "none", color: "#111827" }}>
        {label}
      </label>
    </div>
  );
}
