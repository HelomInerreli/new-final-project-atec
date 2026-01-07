/**
 * Componente checkbox personalizado.
 * Suporta modo controlado e não controlado.
 */

import React, { useId, useState, type ChangeEvent } from "react";
// Importa React e hooks
import "./inputs.css";
// Estilos CSS

// Interface para props do checkbox
interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  className?: string;
}

// Componente padrão para checkbox
export default function Checkbox({
  label,
  checked: controlledChecked,
  onChange,
  name,
  className = "",
}: CheckboxProps) {
  // Gera ID único
  const id = useId();
  // Estado interno para modo não controlado
  const [checked, setChecked] = useState<boolean>(controlledChecked ?? false);
  // Verifica se é controlado
  const isControlled = typeof controlledChecked !== "undefined";

  // Função para lidar com mudança
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setChecked(e.target.checked);
    onChange?.(e);
  };

  // Define se está checado
  const isChecked = isControlled ? (controlledChecked as boolean) : checked;

  // Renderiza checkbox
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
