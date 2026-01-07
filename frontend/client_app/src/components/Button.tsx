import type { ReactNode } from "react";

// Interface para as propriedades do componente Button
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

// Componente Button reutilizável
export function Button({
  children,
  onClick,
  type = "button",
  className,
}: ButtonProps) {
  // Renderiza o botão
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn btn-primary ${className || ""}`}
    >
      {children}
    </button>
  );
}
