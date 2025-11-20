import type { ReactNode } from "react";
import SideBarMenu from "../../components/SideBarMenu";
import './../../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children}: LayoutProps) {
  return (
    <div className="layout-container">
      <SideBarMenu />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
