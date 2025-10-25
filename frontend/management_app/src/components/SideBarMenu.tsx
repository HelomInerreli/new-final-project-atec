import React, { useEffect, useState } from "react";
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  MenuContext,
} from "react-pro-sidebar";
import { NavLink } from "react-router-dom";
import {
  FiBook,
  FiCalendar,
  FiMenu,
  FiChevronLeft,
  FiSearch,
  FiUsers,
  FiSettings,
  FiUser,
  FiPackage,
  FiPieChart,
  FiDollarSign,
  FiSliders,
} from "react-icons/fi";
import {
  BsCalendar2WeekFill,
  BsCalendar3,
  BsCarFrontFill,
  BsCashCoin,
  BsCreditCard2BackFill,
  BsDoorOpenFill,
  BsFileEarmarkTextFill,
  BsFillBoxSeamFill,
  BsFillPeopleFill,
  BsFillPersonVcardFill,
  BsGearFill,
  BsPieChartFill,
  BsTools,
} from "react-icons/bs";
import { Logo } from "./Logo";
import Badge from "react-bootstrap/esm/Badge";

export default function SideBarMenu() {
  const [collapsed, setCollapsed] = useState(false);

  const user = "Helom Valentim"; // placeholder user name

  // small helper to render an icon with an optional overlay badge and configurable size

  // Allow specifying explicit icon size; if icon is a React element from react-icons,
  // inject the `size` prop via cloneElement. Fallback: apply fontSize style to wrapper.
  const IconWithBadgeSized = ({
    icon,
    count,
    size = 45,
  }: {
    icon: React.ReactNode;
    count?: number;
    size?: number;
  }) => {
    const injectedIcon = React.isValidElement(icon)
      ? React.cloneElement(
          icon as React.ReactElement<any, any>,
          { size } as any
        )
      : icon;

    return (
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size,
        }}
      >
        {injectedIcon}
        {typeof count === "number" && (
          <Badge
            pill
            bg="warning"
            text="dark"
            style={{
              position: "absolute",
              top: -10,
              right: -12,
              fontSize: "0.80rem",
              padding: "0.1rem 0.30rem",
              lineHeight: 1,
            }}
          >
            {count}
          </Badge>
        )}
      </span>
    );
  };

  // Keep a CSS variable updated so the layout can adapt to the sidebar width
  useEffect(() => {
    const width = collapsed ? "90px" : "260px";
    document.documentElement.style.setProperty("--sidebar-width", width);
    // expose an icon size CSS variable so pro-sidebar's wrapper SVGs can be sized via CSS
    const iconSize = collapsed ? "30px" : "30px";
    document.documentElement.style.setProperty("--sidebar-icon-size", iconSize);
  }, [collapsed]);

  // Auto-collapse on small screens for responsiveness
  useEffect(() => {
    const mq: MediaQueryList = window.matchMedia("(max-width: 768px)");
    const handle = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    // initial
    setCollapsed(mq.matches);
    // listener
    if (typeof mq.addEventListener === "function")
      mq.addEventListener("change", handle as EventListener);
    else
      mq.addListener(
        handle as (this: MediaQueryList, ev: MediaQueryListEvent) => void
      );
    return () => {
      if (typeof mq.removeEventListener === "function")
        mq.removeEventListener("change", handle as EventListener);
      else
        mq.removeListener(
          handle as (this: MediaQueryList, ev: MediaQueryListEvent) => void
        );
    };
  }, []);

  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    width: collapsed ? 70 : 280,
    transition: "width 180ms ease",
    backgroundColor: "#dc3545", // project red background
    color: "#ffffff",
    zIndex: 1100,
    overflow: "hidden",
    overflowX: "hidden", // avoid horizontal scrollbar when collapsed
    display: "flex",
    flexDirection: "column",
    border: "none",
    boxShadow: "none",
    outline: "none",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "space-between",
    padding: "0.5rem 0.75rem",
  };

  // create icon that shows badge as overlay near icon (same in collapsed and expanded)

  return (
    <aside style={sidebarStyle} aria-hidden={false} className="remove-border">
      <style>{`
        /* lighter red background for submenu container */
        .pro-sidebar .pro-menu .pro-sub-menu .pro-inner-list {
          background-color: #f6b3b3 !important;
        }
        /* submenu item hover */
        .pro-sidebar .pro-menu .pro-sub-menu .pro-inner-list .pro-item > .pro-btn:hover {
          background-color: #f0a8a8 !important;
          color: #ffffff !important;
        }
        /* increase left padding for submenu items to show hierarchy */
        .pro-sidebar .pro-menu .pro-sub-menu .pro-inner-list .pro-menu-item .pro-inner-item {
          padding-left: 2rem !important;
        }
        /* adjust icon container in submenu to align with indentation */
        .pro-sidebar .pro-menu .pro-sub-menu .pro-inner-list .pro-menu-item .pro-inner-item .pro-icon-wrapper {
          padding-left: 0.5rem;
        }
        /* force svg icon sizes using CSS variable set by the component (falls back to 22px) */
        .pro-sidebar .pro-menu .pro-inner-item .pro-icon-wrapper svg {
          width: var(--sidebar-icon-size, 22px) !important;
          height: var(--sidebar-icon-size, 22px) !important;
        }
        /* remove border to aside */
        aside.remove-border,
        aside.remove-border .pro-sidebar,
        aside.remove-border .pro-sidebar > .pro-sidebar-inner {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
      `}</style>
      <div style={headerStyle}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Open sidebar" : "Collapse sidebar"}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            fontSize: 26,
            cursor: "pointer",
            padding: 5,
          }}
        >
          {collapsed ? <FiMenu /> : <FiChevronLeft />}
        </button>

        {!collapsed && (
          <div style={{ fontWeight: 700, fontSize: 26, paddingLeft: 2 }}>
            <Logo scale={0.5} showSubtitle={false} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <Sidebar
          backgroundColor="transparent"
          style={{ border: "none", boxShadow: "none", outline: "none" }}
        >
          {/* User login name and logout option */}
          <div
            style={{
              padding: "0.2rem 0.5rem",
              fontSize: 18,
              opacity: 0.9,
              textAlign: "center",
              color: "#fff",
            }}
          >
            {!collapsed && `Olá, ${user}!`}
          </div>
          <Menu
            menuItemStyles={{
              button: {
                // active class styling (works with NavLink -> active class)
                [`&.active`]: {
                  backgroundColor: "#b91c1c", // tom mais escuro de vermelho
                  color: "#ffffff",
                  borderLeft: "4px solid #fecaca", // borda em tom claro de vermelho
                  paddingLeft: "0.75rem",
                },
                // hover: lighter red than the main sidebar
                "&:hover": {
                  backgroundColor: "#e4606a",
                  color: "#ffffff",
                },
                padding: collapsed ? "0.85rem 0.8rem" : "0.5rem 0.75rem",
                justifyContent: collapsed ? "center" : "flex-start",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                boxSizing: "border-box",
              },
              // style for submenu container/content (some API variants)
              subMenuContent: {
                backgroundColor: "#ffffff", // lighter red tone for submenu background
                color: "#da182bff",
              },
            }}
          >
            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsPieChartFill />}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/dashboard" />}
            >
              {!collapsed && "Dashboard"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsFileEarmarkTextFill />}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/servicesOrders" />}
            >
              {!collapsed && "Ordens de Serviço"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsCalendar2WeekFill />}
                  count={5}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/appointments" />}
            >
              {!collapsed && "Agendamentos"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsFillPeopleFill />}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/clients" />}
            >
              {!collapsed && "Clientes"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsCarFrontFill />}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/vehicles" />}
            >
              {!collapsed && "Veículos"}
            </MenuItem>

            {/* <SubMenu
              icon={
                <IconWithBadgeSized
                  icon={<FiSearch />}
                  size={collapsed ? 25 : 30}
                />
              }
              label={"Pesquisar"}
            >
              <MenuItem component={<NavLink to="/search" />}>
                {!collapsed && "Consulta Matriculas"}
              </MenuItem>
              <MenuItem component={<NavLink to="/search" />}>
                {!collapsed && "Consulta Peças"}
              </MenuItem>
            </SubMenu> */}

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsFillBoxSeamFill />}
                  count={3}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/stock" />}
            >
              {!collapsed && "Stock"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsCreditCard2BackFill />}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/finance" />}
            >
              {!collapsed && "Financeiro"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsFillPersonVcardFill />}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/users" />}
            >
              {!collapsed && "Usuários"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsTools />}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/servicesManagement" />}
            >
              {!collapsed && "Gestão de Serviços"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsGearFill />}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/settings" />}
            >
              {!collapsed && "Configurações"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<BsDoorOpenFill />}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/logout" />}
            >
              {!collapsed && "Sair"}
            </MenuItem>
          </Menu>
        </Sidebar>
      </div>

      {/* small footer area in sidebar */}
      <div style={{ padding: "0.2rem 0.5rem", fontSize: 12, opacity: 0.9 }}>
        {!collapsed && "© 2025 Mecatec. Todos os direitos reservados."}
      </div>
    </aside>
  );
}
