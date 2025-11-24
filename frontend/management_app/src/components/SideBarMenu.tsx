import React, { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  Car,
  Package,
  CreditCard,
  UserCog,
  Wrench,
  Settings,
  LogOut,
  Bell,
  X,
} from "lucide-react";
import { FiMenu, FiChevronLeft } from "react-icons/fi";
import { Logo } from "./Logo";
import Badge from "react-bootstrap/esm/Badge";
import { Modal, Button, ListGroup, Spinner, Alert } from "react-bootstrap";
import http from "../api/http";
import "./SideBarMenu.css";
import "./SideBarMenu.css";

const USER_ID = 1; // TODO: Get from auth context

interface NotificationData {
  id: number;
  notification_id: number;
  user_id: number;
  read_at: string | null;
  created_at: string;
  component: string;
  text: string;
  insertedAt: string;
  alertType: string;
}

export default function SideBarMenu() {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState<
    Record<string, number>
  >({});
  const [totalUnread, setTotalUnread] = useState(0);

  const user = "Helom Valentim"; // placeholder user name

  // Fetch notification counts - total unread for all components
  const fetchNotificationCounts = async () => {
    try {
      // Get total count
      const response = await http.get(`/users/${USER_ID}/notifications/count`);
      const totalCount = response.data.count || 0;

      setTotalUnread(totalCount);

      // Set the same count for all components (total unread)
      setNotificationCounts({
        Stock: totalCount,
        Appointment: totalCount,
        Payment: totalCount,
        Service: totalCount,
        ServiceOrder: totalCount,
      });
    } catch (error) {
      console.error("Error fetching notification counts:", error);
    }
  };

  // Fetch detailed notifications for modal
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await http.get(`/users/${USER_ID}/notifications`);
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotificationCounts();
    const interval = setInterval(fetchNotificationCounts, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = () => {
    fetchNotifications();
    setShowNotificationModal(true);
  };

  const handleMarkAsRead = async (userNotificationId: number) => {
    try {
      await http.put(`/user-notifications/${userNotificationId}/read`);
      // Remove from list and update counts
      setNotifications((prev) =>
        prev.filter((n) => n.id !== userNotificationId)
      );
      fetchNotificationCounts();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await http.put(`/users/${USER_ID}/notifications/read-all`);
      setNotifications([]);
      setNotificationCounts({});
      setTotalUnread(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // small helper to render an icon with an optional overlay badge and configurable size
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
        {typeof count === "number" && count > 0 && (
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

  // Header with bell icon and user name
  const userHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "space-between",
    padding: "0.5rem 0.75rem",
    fontSize: 14,
    color: "#fff",
    gap: "0.5rem",
  };

  const bellButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5rem",
  };

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

      {/* User section with bell icon */}
      <div
        style={
          collapsed
            ? { display: "flex", justifyContent: "center", padding: "0.5rem" }
            : userHeaderStyle
        }
      >
        {!collapsed && (
          <span style={{ flex: 1, textAlign: "left" }}>{user}</span>
        )}
        <button
          style={bellButtonStyle}
          onClick={handleOpenModal}
          title="Notificações"
        >
          <span style={{ position: "relative" }}>
            <Bell size={20} />
            {totalUnread > 0 && (
              <Badge
                pill
                bg="danger"
                style={{
                  position: "absolute",
                  top: -5,
                  right: -8,
                  fontSize: "0.65rem",
                  padding: "0.05rem 0.25rem",
                  lineHeight: 1,
                }}
              >
                {totalUnread}
              </Badge>
            )}
          </span>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <Sidebar
          backgroundColor="transparent"
          style={{ border: "none", boxShadow: "none", outline: "none" }}
        >
          {/* User login name and logout option
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
          </div> */}
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
                  icon={<LayoutDashboard />}
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
                  icon={<FileText />}
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
                  icon={<Calendar />}
                  count={notificationCounts["Appointment"]}
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
                  icon={<Users />}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/customers" />}
            >
              {!collapsed && "Clientes"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized icon={<Car />} size={collapsed ? 25 : 27} />
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
                  icon={<Package />}
                  count={notificationCounts["Stock"]}
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
                  icon={<CreditCard />}
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
                  icon={<UserCog />}
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
                  icon={<Wrench />}
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
                  icon={<Settings />}
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
                  icon={<LogOut />}
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

      {/* Notifications Modal */}
      <Modal
        show={showNotificationModal}
        onHide={() => setShowNotificationModal(false)}
        size="lg"
        centered
        className="notification-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Notificações</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
          {loadingNotifications && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          )}

          {!loadingNotifications && notifications.length === 0 && (
            <Alert variant="info" className="mb-0">
              Nenhuma notificação não lida.
            </Alert>
          )}

          {!loadingNotifications && notifications.length > 0 && (
            <>
              <ListGroup variant="flush">
                {notifications.map((notif) => (
                  <ListGroup.Item
                    key={notif.id}
                    className={`notification-item alert-${notif.alertType}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginBottom: "0.3rem",
                          }}
                        >
                          <strong>{notif.component}</strong>
                          <span className={`badge bg-${notif.alertType}`}>
                            {notif.alertType}
                          </span>
                        </div>
                        <p style={{ margin: "0.3rem 0", fontSize: "0.9rem" }}>
                          {notif.text}
                        </p>
                        <small style={{ opacity: 0.7 }}>
                          {new Date(notif.created_at).toLocaleString("pt-BR")}
                        </small>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => handleMarkAsRead(notif.id)}
                        title="Marcar como lida"
                      >
                        <X size={18} />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div style={{ marginTop: "1rem" }}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="w-100"
                >
                  Marcar todas como lidas
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </aside>
  );
}
