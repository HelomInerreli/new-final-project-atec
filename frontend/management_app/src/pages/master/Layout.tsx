import type { ReactNode } from "react";
import SideBarMenu from "../../components/SideBarMenu";
import "./../../styles/Layout.css";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        flexDirection: "row",
        backgroundColor: "#f8f9fa",
        overflow: "hidden",
      }}
    >
      <SideBarMenu />
      {/* Conteúdo Principal com scroll fixo e fundo degradado */}
      <main
        className="flex-grow-1"
        style={{
          flex: 1,
          marginLeft: "var(--sidebar-width, 260px)",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Container responsivo com padding */}
        <div className="container-fluid px-3 px-md-4 px-lg-5 py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-xl-10">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
