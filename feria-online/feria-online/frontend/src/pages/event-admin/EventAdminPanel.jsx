import { useState, useEffect } from 'react';
import { eventosService } from '../../services/api';
import { EventAdminSidebar } from '../../components/common/Sidebars';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EventAdminPanel() {
  const { user } = useAuth();
  const [evento, setEvento] = useState(null);
  const [stats, setStats] = useState(null);
  const [ticketsDetalle, setTicketsDetalle] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventosService.myEvents().then(async r => {
      const ev = r.data[0];
      if (!ev) { setLoading(false); return; }
      setEvento(ev);
      const [statsRes, eventoRes] = await Promise.all([
        eventosService.getStats(ev.id),
        eventosService.getById(ev.id),
      ]);
      setStats(statsRes.data);
      setTicketsDetalle(eventoRes.data.tickets || []);
    }).finally(() => setLoading(false));
  }, []);

  const totalVendidos = ticketsDetalle.reduce((acc, t) => acc + (t.cantidad_vendida || 0), 0);
  const totalIngresos = ticketsDetalle.reduce((acc, t) => acc + ((t.cantidad_vendida || 0) * Number(t.precio || 0)), 0);

  return (
    <div className="layout-with-sidebar">
      <EventAdminSidebar />
      <div className="main-content">
        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : !evento
            ? <div className="empty-state">
                <div className="empty-state-icon">🎪</div>
                <h3>No tienes un evento asignado</h3>
                <p>El administrador del sistema debe asignarte un evento.</p>
              </div>
            : <>
                <div className="page-header">
                  <div>
                    <h1 className="page-title">{evento.titulo}</h1>
                    <p className="page-subtitle">Panel de administración de tu evento</p>
                  </div>
                  <Link to={`/eventos/${evento.id}`} className="btn btn-secondary">Ver público →</Link>
                </div>

                {/* Stats generales */}
                {stats && (
                  <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                    {[
                      ['👥', 'Participantes', stats.participantes, 'var(--c-primary)'],
                      ['🎤', 'Charlas', stats.charlas, '#8B5CF6'],
                      ['🤝', 'Reuniones', stats.reuniones, '#06B6D4'],
                      ['🎫', 'Tickets vendidos', totalVendidos, 'var(--c-accent)'],
                      ['💰', 'Ingresos totales', `$${totalIngresos.toFixed(2)}`, 'var(--c-success)'],
                    ].map(([icon, label, value, color]) => (
                      <div key={label} className="stat-card">
                        <div className="stat-icon" style={{ background: color + '18' }}>
                          <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                        </div>
                        <div className="stat-label">{label}</div>
                        <div className="stat-value" style={{ color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Desglose de ventas por ticket */}
                {ticketsDetalle.length > 0 && (
                  <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                      <h2 className="card-title">💳 Ventas por ticket</h2>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Ticket</th>
                            <th>Tipo</th>
                            <th>Precio</th>
                            <th>Vendidos</th>
                            <th>Disponibles</th>
                            <th>Progreso</th>
                            <th>Ingresos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ticketsDetalle.map(t => {
                            const vendidos = t.cantidad_vendida || 0;
                            const porcentaje = Math.min((vendidos / t.cantidad_total) * 100, 100);
                            const ingreso = vendidos * Number(t.precio || 0);
                            const disponibles = t.cantidad_total - vendidos;
                            return (
                              <tr key={t.id}>
                                <td style={{ fontWeight: 600 }}>{t.nombre}</td>
                                <td>
                                  <span className={`badge ${t.tipo === 'vip' ? 'badge-accent' : t.tipo === 'empresa' ? 'badge-success' : 'badge-primary'}`}>
                                    {t.tipo?.toUpperCase()}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 700, color: 'var(--c-primary)' }}>
                                  {Number(t.precio) > 0 ? `$${Number(t.precio).toFixed(2)}` : 'Gratis'}
                                </td>
                                <td>
                                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{vendidos}</span>
                                  <span style={{ color: 'var(--c-gray-400)', fontSize: '.82rem' }}> / {t.cantidad_total}</span>
                                </td>
                                <td>
                                  <span className={`badge ${disponibles === 0 ? 'badge-danger' : disponibles < 10 ? 'badge-warning' : 'badge-success'}`}>
                                    {disponibles === 0 ? 'Agotado' : disponibles}
                                  </span>
                                </td>
                                <td style={{ minWidth: 130 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <div style={{ flex: 1, height: 8, background: 'var(--c-gray-100)', borderRadius: 4 }}>
                                      <div style={{
                                        height: '100%', borderRadius: 4,
                                        background: porcentaje >= 90 ? 'var(--c-danger)' : porcentaje >= 60 ? 'var(--c-warning)' : 'var(--c-primary)',
                                        width: `${porcentaje}%`,
                                        transition: 'width .5s ease'
                                      }} />
                                    </div>
                                    <span style={{ fontSize: '.75rem', color: 'var(--c-gray-500)', minWidth: 32 }}>
                                      {porcentaje.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td style={{ fontWeight: 700, color: 'var(--c-success)' }}>
                                  ${ingreso.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: 'var(--c-gray-50)', borderTop: '2px solid var(--c-gray-200)' }}>
                            <td colSpan={3} style={{ padding: '.85rem 1rem', fontWeight: 700, fontSize: '.85rem', color: 'var(--c-gray-500)' }}>
                              TOTALES
                            </td>
                            <td style={{ padding: '.85rem 1rem', fontWeight: 800, fontSize: '1rem' }}>
                              {totalVendidos}
                            </td>
                            <td></td>
                            <td></td>
                            <td style={{ padding: '.85rem 1rem', fontWeight: 800, fontSize: '1rem', color: 'var(--c-success)' }}>
                              ${totalIngresos.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Detalles del evento */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <div className="card-header">
                    <h2 className="card-title">📋 Detalles del evento</h2>
                  </div>
                  <div className="card-body">
                    {[
                      ['📅 Inicio', format(new Date(evento.fecha_inicio), "d 'de' MMMM yyyy · HH:mm", { locale: es })],
                      ['🏁 Fin', format(new Date(evento.fecha_fin), "d 'de' MMMM yyyy · HH:mm", { locale: es })],
                      ['💻 Modalidad', evento.modalidad],
                      ['📊 Estado', evento.estado],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: '1rem', padding: '.5rem 0', borderBottom: '1px solid var(--c-gray-100)', fontSize: '.9rem' }}>
                        <span style={{ minWidth: 120, color: 'var(--c-gray-500)', fontWeight: 500 }}>{k}</span>
                        <span style={{ textTransform: 'capitalize' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accesos rápidos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
                  {[
                    ['🎤', 'Charlas', '/mi-evento/charlas'],
                    ['🤝', 'Reuniones', '/mi-evento/reuniones'],
                    ['🎫', 'Tickets', '/mi-evento/tickets'],
                    ['📷', 'Escáner QR', '/mi-evento/escanear'],
                    ['👥', 'Asistentes', '/mi-evento/asistentes'],
                  ].map(([icon, label, to]) => (
                    <Link key={label} to={to} className="card" style={{ textDecoration: 'none' }}>
                      <div className="card-body" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{icon}</div>
                        <div style={{ fontWeight: 700, color: 'var(--c-gray-900)', fontSize: '.88rem' }}>
                          Gestionar {label}
                        </div>
                        <div style={{ fontSize: '.78rem', color: 'var(--c-primary)', marginTop: '.2rem' }}>
                          Ir al panel →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
        }
      </div>
    </div>
  );
}