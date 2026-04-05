import { useState, useEffect } from 'react';
import { eventosService } from '../../services/api';
import { EventAdminSidebar } from '../../components/common/Sidebars';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EventAdminPanel() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventosService.myEvents().then(r => {
      setEventos(r.data);
      if (r.data.length > 0) {
        eventosService.getStats(r.data[0].id).then(s => setStats(s.data));
      }
    }).finally(() => setLoading(false));
  }, []);

  const evento = eventos[0];

  return (
    <div className="layout-with-sidebar">
      <EventAdminSidebar />
      <div className="main-content">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : !evento ? (
          <div className="empty-state"><div className="empty-state-icon">🎪</div><h3>No tienes un evento asignado</h3><p>El administrador del sistema debe asignarte un evento.</p></div>
        ) : (
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">{evento.titulo}</h1>
                <p className="page-subtitle">Panel de administración de tu evento</p>
              </div>
              <Link to={`/eventos/${evento.id}`} className="btn btn-secondary">Ver público →</Link>
            </div>

            {stats && (
              <div className="stats-grid">
                {[['👥', 'Participantes', stats.participantes], ['🎤', 'Charlas', stats.charlas], ['🤝', 'Reuniones', stats.reuniones], ['💰', 'Ingresos', `$${Number(stats.ingresos).toFixed(2)}`]].map(([icon, label, value]) => (
                  <div key={label} className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--c-primary-light)' }}><span style={{ fontSize: '1.25rem' }}>{icon}</span></div>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{value}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="card"><div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Detalles del evento</h3>
              {[['📅 Inicio', format(new Date(evento.fecha_inicio), "d 'de' MMMM yyyy · HH:mm", { locale: es })], ['🏁 Fin', format(new Date(evento.fecha_fin), "d 'de' MMMM yyyy · HH:mm", { locale: es })], ['💻 Modalidad', evento.modalidad], ['📊 Estado', evento.estado]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '1rem', padding: '.5rem 0', borderBottom: '1px solid var(--c-gray-100)', fontSize: '.9rem' }}>
                  <span style={{ minWidth: 120, color: 'var(--c-gray-500)', fontWeight: 500 }}>{k}</span>
                  <span style={{ textTransform: 'capitalize' }}>{v}</span>
                </div>
              ))}
            </div></div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {[['🎤', 'Charlas', '/mi-evento/charlas'], ['🤝', 'Reuniones', '/mi-evento/reuniones'], ['🎫', 'Tickets', '/mi-evento/tickets']].map(([icon, label, to]) => (
                <Link key={label} to={to} className="card" style={{ textDecoration: 'none' }}>
                  <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>{icon}</div>
                    <div style={{ fontWeight: 700, color: 'var(--c-gray-900)' }}>Gestionar {label}</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--c-primary)', marginTop: '.25rem' }}>Ir al panel →</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
