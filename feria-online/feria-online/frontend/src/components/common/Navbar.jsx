import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RolBadge = ({ rol }) => {
  const map = { admin: ['#5B4CFF', 'Admin'], admin_evento: ['#FF6B35', 'Org. Evento'], empresa: ['#22C55E', 'Empresa'], participante: ['#6B7280', 'Participante'] };
  const [color, label] = map[rol] || ['#6B7280', rol];
  return <span style={{ background: color + '18', color, fontSize: '.72rem', fontWeight: 700, padding: '.15rem .55rem', borderRadius: 999 }}>{label}</span>;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span style={{ fontSize: '1.4rem' }}>🎪</span> FeriaOnline
        </Link>

        <div className="navbar-nav">
          <NavLink to="/eventos" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <span>Eventos</span>
          </NavLink>
          <NavLink to="/empresas" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <span>Empresas</span>
          </NavLink>

          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" style={{ marginLeft: '.5rem' }}>Ingresar</Link>
              <Link to="/registro" className="btn btn-primary btn-sm" style={{ marginLeft: '.25rem' }}>Registrarse</Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginLeft: '.5rem' }}>
              {/* Role-based nav links */}
              {user.rol === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                  <span>Panel Admin</span>
                </NavLink>
              )}
              {user.rol === 'admin_evento' && (
                <NavLink to="/mi-evento" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                  <span>Mi Evento</span>
                </NavLink>
              )}
              {user.rol === 'empresa' && (
                <NavLink to="/empresa/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                  <span>Mi Empresa</span>
                </NavLink>
              )}
              {user.rol === 'participante' && (
                <NavLink to="/mis-compras" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                  <span>Mis Tickets</span>
                </NavLink>
              )}

              {/* User dropdown (simple) */}
              <div style={{ position: 'relative' }} className="user-menu-wrap">
                <button
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}
                  onClick={() => document.getElementById('user-dropdown').classList.toggle('open')}
                >
                  <span style={{ fontSize: '1rem' }}>👤</span>
                  <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.nombre}
                  </span>
                  <RolBadge rol={user.rol} />
                </button>
                <div id="user-dropdown" style={{
                  display: 'none', position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,.12)', minWidth: 180, zIndex: 200, overflow: 'hidden'
                }}>
                  <style>{`.user-menu-wrap #user-dropdown.open { display: block !important; }`}</style>
                  <Link to="/perfil" className="dropdown-item" style={{ display: 'block', padding: '.7rem 1rem', fontSize: '.88rem', color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F3F4F6' }}
                    onClick={() => document.getElementById('user-dropdown').classList.remove('open')}>
                    ⚙️ Mi perfil
                  </Link>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '.7rem 1rem', fontSize: '.88rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
