import { NavLink } from 'react-router-dom';

const Icon = ({ d }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export function AdminSidebar() {
  const links = [
    { to: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', end: true },
    { to: '/admin/eventos', label: 'Eventos', icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { to: '/admin/usuarios', label: 'Usuarios', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { to: '/admin/empresas', label: 'Empresas', icon: 'M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM9 22V12h6v10' },
    { to: '/admin/inscripciones', label: 'Inscripciones 🐷', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4' },
  ];
  return (
    <aside className="sidebar">
      <span className="sidebar-title">Administración</span>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <Icon d={l.icon} />{l.label}
        </NavLink>
      ))}
    </aside>
  );
}

export function EventAdminSidebar() {
  const links = [
    { to: '/mi-evento', label: 'Resumen', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', end: true },
    { to: '/mi-evento/charlas', label: 'Charlas', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { to: '/mi-evento/reuniones', label: 'Reuniones', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { to: '/mi-evento/tickets', label: 'Tickets', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 0 0-2 2v3a2 2 0 0 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 1 0-4V7a2 2 0 0 0-2-2H5z' },
    { to: '/mi-evento/escanear', label: 'Escáner QR', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
{ to: '/mi-evento/asistentes', label: 'Asistentes', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
  ];
  return (
    <aside className="sidebar">
      <span className="sidebar-title">Mi Evento</span>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <Icon d={l.icon} />{l.label}
        </NavLink>
      ))}
    </aside>
  );
}

export function EmpresaSidebar() {
  const links = [
    { to: '/empresa/dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', end: true },
    { to: '/empresa/productos', label: 'Productos', icon: 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 12h.01' },
    { to: '/eventos', label: 'Ver Eventos', icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
  ];
  return (
    <aside className="sidebar">
      <span className="sidebar-title">Mi Empresa</span>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <Icon d={l.icon} />{l.label}
        </NavLink>
      ))}
    </aside>
  );
}
