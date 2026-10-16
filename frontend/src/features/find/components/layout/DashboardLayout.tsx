import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "../../styles/HomePage.css";

type DashboardLayoutProps = {
  username: string | undefined;
  section?: string;
  children: ReactNode;
};

export function DashboardLayout({
  username,
  section = "INICIO",
  children,
}: DashboardLayoutProps) {
  const location = useLocation();

  return (
    <div className="home-page">
      <aside className="sidebar">
        <Link className="home-brand" to="/" aria-label="Dashfinder, inicio">
          <span className="home-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M7 24.5 13.4 8l4.2 10.1 2.3-5.6L25 24.5" />
              <circle cx="23.5" cy="8.5" r="2.5" />
            </svg>
          </span>
          <span>dashfinder</span>
        </Link>

        <span className="sidebar-label">MENÚ PRINCIPAL</span>
        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink
            className={({ isActive }) => `main-nav-link${isActive ? " active" : ""}`}
            to="/"
            end
            title="Inicio"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m2.8 8.8 7.2-6 7.2 6v8.4a.8.8 0 0 1-.8.8h-4.1v-5.2H7.7V18H3.6a.8.8 0 0 1-.8-.8V8.8Z" />
            </svg>
            <span className="main-nav-link-label">Inicio</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => `main-nav-link${isActive ? " active" : ""}`}
            to="/dashmod"
            title="Dashmod"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 4.5h14v11H3zM7 8h2m2 0h2M7 11h2m2 0h2" />
            </svg>
            <span className="main-nav-link-label">Dashmod</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => `main-nav-link${isActive ? " active" : ""}`}
            to="/tus-servidores"
            title="Tus servidores"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 3.5h14v5H3zm0 8h14v5H3z" />
              <path d="M6 6h.01M6 14h.01m3-8h5m-5 8h5" />
            </svg>
            <span className="main-nav-link-label">Tus servidores</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => `main-nav-link${isActive ? " active" : ""}`}
            to="/configuracion"
            title="Configuración"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M8 3h4l.6 2.1 1.8 1 2-.6 2 3.5-1.5 1.5v2l1.5 1.5-2 3.5-2-.6-1.8 1L12 20H8l-.6-2.1-1.8-1-2 .6-2-3.5L3.1 12v-2L1.6 8.5l2-3.5 2 .6 1.8-1L8 3Z" transform="translate(0 -1.5) scale(.9)" />
              <circle cx="10" cy="10" r="2.5" />
            </svg>
            <span className="main-nav-link-label">Configuración</span>
          </NavLink>
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-workspace">
          <span className="sidebar-label">TU ESPACIO</span>
          <div className="workspace-card">
            <span className="workspace-card-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M3 5.5h14M5 3v5m10-5v5M4 9h12v7.5H4z" />
                <path d="m7 12 2 2 4-4" />
              </svg>
            </span>
            <span>
              <strong>Buscador</strong>
              <small><span className="status-dot" />Listo para explorar</small>
            </span>
          </div>
        </div>

        <div className="sidebar-divider" />
        <div className="sidebar-user" title={username ?? "Cuenta activa"}>
          <span className="user-avatar" aria-hidden="true">
            {(username?.charAt(0) || "U").toUpperCase()}
          </span>
          <span className="sidebar-user-details">
            <strong>{username}</strong>
            <small>Cuenta activa</small>
          </span>
        </div>
      </aside>

      <div className="home-workspace">
        <header className="workspace-topbar">
          <span className="topbar-path">DASHFINDER <span>/</span> {section}</span>
          <span className="topbar-status"><span className="status-dot" />Sistema disponible</span>
        </header>
        <main className="home-content">
          <div className="page-transition" key={location.pathname}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
