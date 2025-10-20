import type { ReactNode } from "react";
import SideBarMenu from "../../components/SideBarMenu";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div
      className={`min-vh-100 ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
      }}
    >
      <SideBarMenu />
      {/* Conteúdo Principal com padding para compensar header e footer fixos */}
      <main
        className="flex-grow-1"
        style={{
          paddingTop: "90px", // Espaço para header fixo
          paddingBottom: "80px", // Espaço para footer fixo
          minHeight: "calc(100vh - 170px)",
          // push content to the right of the fixed sidebar. --sidebar-width is updated by the sidebar component
          marginLeft: 'var(--sidebar-width, 260px)',
        }}
      >
        {/* Container responsivo que ocupa 80% da largura */}
        <div className="container-fluid px-3 px-md-4 px-lg-5">
          <div className="row justify-content-center">
            <div className="col-12 col-xl-10" style={{ maxWidth: "80%" }}>
              {children}
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
