import React, { useEffect, useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { NavLink } from 'react-router-dom';
import { FiBook, FiCalendar, FiMenu, FiChevronLeft, FiSearch, FiUsers, FiSettings, FiUser, FiPackage, FiPieChart, FiDollarSign } from 'react-icons/fi';
import { Logo } from './Logo';
import Badge from 'react-bootstrap/esm/Badge';

export default function SideBarMenu() {
  const [collapsed, setCollapsed] = useState(false);

  // small helper to render an icon with an optional overlay badge
  const IconWithBadge = ({ icon, count }: { icon: React.ReactNode; count?: number }) => (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
      {typeof count === 'number' && (
        <Badge
          pill
          bg="warning"
          text="dark"
          style={{
            position: 'absolute',
            top: -6,
            right: -10,
            fontSize: '0.58rem',
            padding: '0.1rem 0.26rem',
            lineHeight: 1,
          }}
        >
          {count}
        </Badge>
      )}
    </span>
  );

  // Keep a CSS variable updated so the layout can adapt to the sidebar width
  useEffect(() => {
    const width = collapsed ? '80px' : '260px';
    document.documentElement.style.setProperty('--sidebar-width', width);
  }, [collapsed]);

  // Auto-collapse on small screens for responsiveness
  useEffect(() => {
    const mq: MediaQueryList = window.matchMedia('(max-width: 768px)');
    const handle = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    // initial
    setCollapsed(mq.matches);
    // listener
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', handle as EventListener);
  else mq.addListener(handle as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', handle as EventListener);
  else mq.removeListener(handle as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    };
  }, []);

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: collapsed ? 60 : 260,
    transition: 'width 180ms ease',
    backgroundColor: '#dc3545', // project red background
    color: '#ffffff',
    zIndex: 1100,
    overflow: 'hidden',
    overflowX: 'hidden', // avoid horizontal scrollbar when collapsed
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'space-between',
    padding: '0.5rem 0.75rem',
  };

  // create icon that shows badge as overlay near icon (same in collapsed and expanded)

  return (
    <aside style={sidebarStyle} aria-hidden={false}>
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
      `}</style>
      <div style={headerStyle}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            fontSize: 20,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          {collapsed ? <FiMenu /> : <FiChevronLeft />}
        </button>

        {!collapsed && <div style={{ fontWeight: 700, fontSize: 16, paddingLeft: 2 }}><Logo scale={0.5} showSubtitle={false}/></div>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Sidebar backgroundColor="transparent">
          <Menu
            menuItemStyles={{
              button: {
                // active class styling (works with NavLink -> active class)
                [`&.active`]: {
                  backgroundColor: '#b91c1c', // tom mais escuro de vermelho
                  color: '#ffffff',
                  borderLeft: '4px solid #fecaca', // borda em tom claro de vermelho
                  paddingLeft: '0.75rem',
                },
                // hover: lighter red than the main sidebar
                '&:hover': {
                  backgroundColor: '#e4606a',
                  color: '#ffffff',
                },
                padding: collapsed ? '0.45rem 0.5rem' : '0.5rem 0.75rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                boxSizing: 'border-box',
              },
              // style for submenu container/content (some API variants)
              subMenuContent: {
                backgroundColor: '#ffffff', // lighter red tone for submenu background
                color: '#da182bff',
              },

            }}
          >
            <MenuItem icon={<IconWithBadge icon={<FiPieChart />} />} component={<NavLink to="/dashboard" />}>
              {!collapsed && 'Dashboard'}
            </MenuItem>

            <MenuItem icon={<IconWithBadge icon={<FiBook />} />} component={<NavLink to="/servicesOrders" />}>
              {!collapsed && 'Ordens de Serviço'}
            </MenuItem>

            <MenuItem icon={<IconWithBadge icon={<FiCalendar />} count={5}/>} component={<NavLink to="/appointments" />}>
              {!collapsed && 'Agendamentos'}
            </MenuItem>

            <MenuItem icon={<IconWithBadge icon={<FiUser />} />} component={<NavLink to="/clients" />}>
              {!collapsed && 'Clientes'}
            </MenuItem>

            <SubMenu icon={<IconWithBadge icon={<FiSearch />} />} label={'Pesquisar'}>
              <MenuItem  component={<NavLink to="/search" />}>
                  {!collapsed && 'Consulta Matriculas'}
              </MenuItem>
              <MenuItem  component={<NavLink to="/search" />}>
                    {!collapsed && 'Consulta Peças'}
                </MenuItem>
            </SubMenu>

            <MenuItem icon={<IconWithBadge icon={<FiPackage />} count={3} />} component={<NavLink to="/stock" />}>
              {!collapsed && 'Stock'} 
            </MenuItem>

            <MenuItem icon={<IconWithBadge icon={<FiDollarSign />} />} component={<NavLink to="/finance" />}>
              {!collapsed && 'Financeiro'}
            </MenuItem>

            <MenuItem icon={<IconWithBadge icon={<FiUsers />} />} component={<NavLink to="/users" />}>
              {!collapsed && 'Usuários'}
            </MenuItem>

            <MenuItem icon={<IconWithBadge icon={<FiSettings />} />} component={<NavLink to="/settings" />}>
              {!collapsed && 'Configurações'}
            </MenuItem>
          </Menu>
        </Sidebar>
      </div>

      {/* small footer area in sidebar */}
      <div style={{ padding: '0.2rem 0.5rem', fontSize: 12, opacity: 0.9 }}>
        {!collapsed && '© 2025 Mecatec. Todos os direitos reservados.'}
      </div>
    </aside>
  );
}