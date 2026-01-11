import React, { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
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
  UserCircle,
} from "lucide-react";
import { FiMenu, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Logo } from "./Logo";
import Badge from "react-bootstrap/esm/Badge";
import { Modal, Button, ListGroup, Spinner, Alert } from "react-bootstrap";
import http, { setAuthToken } from "../api/http";
import "./SideBarMenu.css";
import "./SideBarMenu.css";
import logoMecatec from "../assets/LOGO_MECATEC_fundo.png";
import logoMaCollapsed from "../assets/LOGO_MA_Vermelho_SFundo.png";

// Interface para dados de notificação
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

// Componente do menu lateral
export default function SideBarMenu() {
  // Estados do componente
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState<
    Record<string, number>
  >({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [userName, setUserName] = useState<string>("...");
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isManager, setIsManager] = useState<boolean>(false);

  // Função para traduzir o role para português
  const translateRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      admin: "Admin",
      gestor: "Gestor",
      mecanico: "Mecânico",
      mecânico: "Mecânico",
      eletricista: "Eletricista",
      chapeiro: "Chapeiro",
      pintor: "Pintor",
      estética: "Estética",
      "técnico de vidros": "Técnico de Vidros",
      vidros: "Vidros",
    };
    return roleMap[role.toLowerCase()] || role;
  };

  // Função para obter cor do badge baseado no role
  const getRoleBadgeColor = (role: string): string => {
    const roleColors: Record<string, string> = {
      admin: "#eab308", // amarelo
      gestor: "#7c3aed", // roxo
      mecanico: "#2563eb", // azul
      mecânico: "#2563eb",
      eletricista: "#ea580c", // laranja
      chapeiro: "#059669", // verde
      pintor: "#8b5cf6", // violeta
      estética: "#ec4899", // rosa
      "técnico de vidros": "#06b6d4", // ciano
      vidros: "#06b6d4",
    };
    return roleColors[role.toLowerCase()] || "#6b7280"; // cinza padrão
  };

  // Busca contagens de notificações
  const fetchNotificationCounts = async () => {
    try {
      if (!userId) return;

      // Get total count for bell icon
      const totalResponse = await http.get(
        `/users/${userId}/notifications/count`
      );
      const totalCount = totalResponse.data.count || 0;
      setTotalUnread(totalCount);

      // Get counts per component for menu icons
      const components = [
        "Dashboard",
        "ServiceOrder",
        "Appointment",
        "Customer",
        "Vehicle",
        "Stock",
        "Payment",
        "User",
        "Service",
        "Settings",
      ];
      const counts: Record<string, number> = {};

      await Promise.all(
        components.map(async (component) => {
          try {
            const res = await http.get(
              `/users/${userId}/notifications/count/${component}`
            );
            counts[component] = res.data.count || 0;
          } catch (err) {
            counts[component] = 0;
          }
        })
      );

      setNotificationCounts(counts);
    } catch (error) {
      console.error("Error fetching notification counts:", error);
    }
  };

  // Busca notificações detalhadas para o modal
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      if (!userId) return;
      const response = await http.get(`/users/${userId}/notifications`);
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Carrega informações do usuário do backend usando token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    // ensure auth header is set in case of reload
    setAuthToken(token);
    http
      .get(`/managementauth/me`)
      .then((res) => {
        const { id, name, role, is_manager } = res.data;
        setUserId(id);
        setUserName(name);
        setUserRole(role || "");
        setIsManager(is_manager || false);
      })
      .catch((err) => {
        console.error("Failed to load user info", err);
      });
  }, []);

  // Busca contagens de notificações periodicamente
  useEffect(() => {
    fetchNotificationCounts();
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Abre o modal de notificações
  const handleOpenModal = () => {
    fetchNotifications();
    setShowNotificationModal(true);
  };

  // Função para obter cor de fundo baseada no alertType
  const getNotificationBackgroundColor = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case "danger":
        return "rgba(220, 53, 69, 0.08)"; // vermelho fraco
      case "warning":
        return "rgba(255, 193, 7, 0.08)"; // amarelo fraco
      case "success":
        return "rgba(25, 135, 84, 0.08)"; // verde fraco
      case "info":
      default:
        return "rgba(13, 110, 253, 0.08)"; // azul fraco
    }
  };

  // Função para traduzir o nome do componente
  const translateComponent = (component: string): string => {
    const componentMap: Record<string, string> = {
      Dashboard: "Dashboard",
      ServiceOrder: "Ordens de Serviço",
      Appointment: "Agendamentos",
      Customer: "Clientes",
      Vehicle: "Veículos",
      Stock: "Stock",
      Payment: "Pagamentos",
      User: "Usuários",
      Service: "Gestão de Serviços",
      Settings: "Meu Perfil",
    };
    return componentMap[component] || component;
  };

  // Marca notificação como lida
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

  // Marca todas as notificações como lidas
  const handleMarkAllAsRead = async () => {
    try {
      if (!userId) return;
      await http.put(`/users/${userId}/notifications/read-all`);
      setNotifications([]);
      setNotificationCounts({});
      setTotalUnread(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Componente auxiliar para renderizar ícone com badge opcional e tamanho configurável
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

  // Mantém variável CSS atualizada para que o layout se adapte à largura da barra lateral
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

  // Função para verificar se usuário tem permissão para acessar item do menu
  const hasMenuAccess = (menuItem: string): boolean => {
    // Admin e Gestor têm acesso a tudo
    if (
      userRole.toLowerCase() === "admin" ||
      userRole.toLowerCase() === "management" ||
      isManager
    ) {
      return true;
    }

    // Itens permitidos para todos os usuários autenticados
    const allowedForAll = [
      "home",
      "servicesOrders",
      "appointments",
      "vehicles",
      "stock",
      "settings",
      "logout",
    ];

    return allowedForAll.includes(menuItem);
  };

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
    minHeight: "120px",
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
        {collapsed ? (
          <div
            onClick={() => setCollapsed(false)}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              cursor: "pointer",
            }}
          >
            <img
              src={logoMaCollapsed}
              alt="Mecatec Logo"
              style={{ height: 100, objectFit: "contain" }}
            />
          </div>
        ) : (
          <>
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Fechar menu"
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                fontSize: 26,
                cursor: "pointer",
                padding: 5,
              }}
            >
              <FiChevronLeft />
            </button>
            <div
              onClick={() => setCollapsed(true)}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                paddingRight: "2rem",
                cursor: "pointer",
              }}
            >
              <img
                src={logoMecatec}
                alt="Mecatec Logo"
                style={{ height: 60, objectFit: "contain" }}
              />
            </div>
          </>
        )}
      </div>

      {/* User section with bell icon */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: collapsed ? "0.5rem" : "0.5rem 0.75rem",
          gap: "0.25rem",
        }}
      >
        {!collapsed && userRole && (
          <span
            style={{
              fontSize: "0.6rem",
              padding: "0.1rem 0.4rem",
              backgroundColor: getRoleBadgeColor(userRole),
              color: "white",
              borderRadius: "0.75rem",
              fontWeight: "600",
              textAlign: "center",
              alignSelf: "flex-start",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            {translateRole(userRole)}
          </span>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            fontSize: 14,
            color: "#fff",
            gap: "0.5rem",
          }}
        >
          {!collapsed && (
            <span style={{ flex: 1, textAlign: "left" }}>{userName}</span>
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
            {hasMenuAccess("home") && (
              <MenuItem
                icon={
                  <IconWithBadgeSized
                    icon={<Home />}
                    count={0}
                    size={collapsed ? 25 : 27}
                  />
                }
                component={<NavLink to="/" />}
              >
                {!collapsed && "Início"}
              </MenuItem>
            )}

            {hasMenuAccess("dashboard") && (
              <MenuItem
                icon={
                  <IconWithBadgeSized
                    icon={<LayoutDashboard />}
                    count={notificationCounts["Dashboard"]}
                    size={collapsed ? 25 : 27}
                  />
                }
                component={<NavLink to="/dashboard" />}
              >
                {!collapsed && "Dashboard"}
              </MenuItem>
            )}

            <MenuItem
              active={location.pathname.startsWith("/servicesOrders")}
              icon={
                <IconWithBadgeSized
                  icon={<FileText />}
                  count={notificationCounts["ServiceOrder"]}
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

            {hasMenuAccess("customers") && (
              <MenuItem
                icon={
                  <IconWithBadgeSized
                    icon={<Users />}
                    count={notificationCounts["Customer"]}
                    size={collapsed ? 25 : 27}
                  />
                }
                component={<NavLink to="/customers" />}
              >
                {!collapsed && "Clientes"}
              </MenuItem>
            )}

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<Car />}
                  count={notificationCounts["Vehicle"]}
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
                  icon={<Package />}
                  count={notificationCounts["Stock"]}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/stock" />}
            >
              {!collapsed && "Stock"}
            </MenuItem>

            {hasMenuAccess("finance") && (
              <MenuItem
                icon={
                  <IconWithBadgeSized
                    icon={<CreditCard />}
                    count={notificationCounts["Payment"]}
                    size={collapsed ? 25 : 27}
                  />
                }
                component={<NavLink to="/finance" />}
              >
                {!collapsed && "Financeiro"}
              </MenuItem>
            )}

            {hasMenuAccess("users") && (
              <MenuItem
                icon={
                  <IconWithBadgeSized
                    icon={<UserCog />}
                    count={notificationCounts["User"]}
                    size={collapsed ? 25 : 27}
                  />
                }
                component={<NavLink to="/users" />}
              >
                {!collapsed && "Funcionários"}
              </MenuItem>
            )}

            {hasMenuAccess("services") && (
              <MenuItem
                icon={
                  <IconWithBadgeSized
                    icon={<Wrench />}
                    count={notificationCounts["Service"]}
                    size={collapsed ? 25 : 27}
                  />
                }
                component={<NavLink to="/servicesManagement" />}
              >
                {!collapsed && "Gestão de Serviços"}
              </MenuItem>
            )}

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<UserCircle />}
                  count={notificationCounts["Settings"]}
                  size={collapsed ? 25 : 27}
                />
              }
              component={<NavLink to="/settings" />}
            >
              {!collapsed && "Meu Perfil"}
            </MenuItem>

            <MenuItem
              icon={
                <IconWithBadgeSized
                  icon={<LogOut />}
                  size={collapsed ? 25 : 27}
                />
              }
              onClick={() => {
                // clear token and go to login
                setAuthToken(undefined);
                localStorage.removeItem("access_token");
                window.location.href = "/login";
              }}
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
                    className={`notification-item`}
                    style={{
                      backgroundColor: getNotificationBackgroundColor(
                        notif.alertType
                      ),
                    }}
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
                          <strong>{translateComponent(notif.component)}</strong>
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
