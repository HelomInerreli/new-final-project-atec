import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div
      className={`min-vh-100 bg-light ${className}`}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Header />

      {/* Conteúdo Principal com padding para compensar header e footer fixos */}
      <main
        style={{
          paddingTop: "0px",
          paddingBottom: "10px",
          flex: 1,
          minHeight: "calc(100vh - 140px)",
        }}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
}
