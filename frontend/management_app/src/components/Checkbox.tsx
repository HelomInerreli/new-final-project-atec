import React, { useId, useState, type ChangeEvent } from "react";
import "./inputs.css";

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  className?: string;
}

export default function Checkbox({
  label,
  checked: controlledChecked,
  onChange,
  name,
  className = "",
}: CheckboxProps) {
  const id = useId();
  const [checked, setChecked] = useState<boolean>(controlledChecked ?? false);
  const isControlled = typeof controlledChecked !== "undefined";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setChecked(e.target.checked);
    onChange?.(e);
  };

  const isChecked = isControlled ? (controlledChecked as boolean) : checked;

  return (
    <div className={`mb-input-wrapper ${className} mb-checkbox`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        style={{
          width: 18,
          height: 18,
          accentColor: "#dc3545",
          borderRadius: 4,
        }}
      />
      <label htmlFor={id} style={{ userSelect: "none", color: "#7c1c1c" }}>
        {label}
      </label>
    </div>
  );
}
