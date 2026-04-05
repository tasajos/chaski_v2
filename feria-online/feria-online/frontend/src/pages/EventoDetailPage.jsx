import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventosService, charlasService, ticketsService, reunionesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Tab = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '.6rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: 600, fontSize: '.88rem', transition: 'all .15s',
    background: active ? 'var(--c-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--c-gray-500)',
  }}>{children}</button>
);

export default function EventoDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [inscribiendo, setInscribiendo] = useState(false);

  useEffect(() => {
    eventosService.getById(id)
      .then(r => setEvento(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  const inscribirse = async () => {
    if (!user) return toast.error('Debes iniciar sesión');
    setInscribiendo(true);
    try {
      await eventosService.inscribirse(id);
      toast.success('¡Te has inscrito al evento!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al inscribirse');
    } finally {
      setInscribiendo(false);
    }
  };

  const comprarTicket = async (ticketId) => {
    if (!user) return toast.error('Debes iniciar sesión');
    try {
      const res = await ticketsService.comprar(ticketId, { cantidad: 1 });
      toast.success(`¡Ticket comprado! Código: ${res.data.codigo_qr.slice(0, 8).toUpperCase()}`);
      const r = await eventosService.getById(id);
      setEvento(r.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al comprar ticket');
    }
  };

  const inscribirseCharla = async (charlaId) => {
    if (!user) return toast.error('Debes iniciar sesión');
    try {
      await charlasService.inscribirse(charlaId);
      toast.success('¡Inscrito a la charla!');
      const r = await eventosService.getById(id);
      setEvento(r.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const reservarReunion = async (reunionId) => {
    if (!user) return toast.error('Debes iniciar sesión');
    try {
      await reunionesService.reservar(reunionId);
      toast.success('¡Reserva confirmada!');
      const r = await eventosService.getById(id);
      setEvento(r.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reservar');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!evento) return <div className="container page-content"><div className="empty-state"><h3>Evento no encontrado</h3></div></div>;

  const fechaInicio = format(new Date(evento.fecha_inicio), "d 'de' MMMM yyyy · HH:mm", { locale: es });
  const fechaFin = format(new Date(evento.fecha_fin), "d 'de' MMMM yyyy · HH:mm", { locale: es });

  return (
    <div className="page-content">
      {/* Banner */}
      <div style={{ background: evento.imagen_banner ? `url(${evento.imagen_banner}) center/cover` : 'linear-gradient(135deg, #1a0e4e, #5B4CFF)', height: 280, position: 'relative', marginBottom: '2rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{evento.modalidad}</span>
              <span className={`badge ${evento.estado === 'publicado' ? 'badge-success' : 'badge-gray'}`}>{evento.estado}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{evento.titulo}</h1>
          </div>
        </div>
      </div>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          {/* Main */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '.25rem', background: 'var(--c-gray-100)', borderRadius: 10, padding: '.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {[['info', '📋 Información'], ['charlas', `🎤 Charlas (${evento.charlas?.length || 0})`], ['tickets', `🎫 Tickets (${evento.tickets?.length || 0})`], ['reuniones', `🤝 Reuniones (${evento.reuniones?.length || 0})`]].map(([t, label]) => (
                <Tab key={t} active={tab === t} onClick={() => setTab(t)}>{label}</Tab>
              ))}
            </div>

            {tab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card"><div className="card-body">
                  <h3 style={{ fontWeight: 700, marginBottom: '.75rem' }}>Sobre el evento</h3>
                  <p style={{ color: 'var(--c-gray-700)', lineHeight: 1.7 }}>{evento.descripcion || 'Sin descripción.'}</p>
                </div></div>
                <div className="card"><div className="card-body">
                  <h3 style={{ fontWeight: 700, marginBottom: '.75rem' }}>Detalles</h3>
                  {[['📅 Inicio', fechaInicio], ['🏁 Fin', fechaFin], ['📍 Ubicación', evento.ubicacion || 'Virtual'], ['💻 Modalidad', evento.modalidad], ['👤 Organizador', evento.admin_nombre ? `${evento.admin_nombre} ${evento.admin_apellido}` : 'No asignado']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: '1rem', padding: '.5rem 0', borderBottom: '1px solid var(--c-gray-100)', fontSize: '.9rem' }}>
                      <span style={{ minWidth: 130, color: 'var(--c-gray-500)', fontWeight: 500 }}>{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div></div>
              </div>
            )}

            {tab === 'charlas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {!evento.charlas?.length
                  ? <div className="empty-state"><div className="empty-state-icon">🎤</div><h3>Sin charlas aún</h3></div>
                  : evento.charlas.map(c => (
                    <div key={c.id} className="card"><div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <h3 style={{ fontWeight: 700, marginBottom: '.3rem' }}>{c.titulo}</h3>
                          {c.ponente && <p style={{ fontSize: '.85rem', color: 'var(--c-primary)', fontWeight: 600, marginBottom: '.3rem' }}>🎙️ {c.ponente}</p>}
                          {c.descripcion && <p style={{ fontSize: '.85rem', color: 'var(--c-gray-500)', marginBottom: '.5rem' }}>{c.descripcion}</p>}
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '.8rem', color: 'var(--c-gray-500)', flexWrap: 'wrap' }}>
                            <span>📅 {format(new Date(c.fecha_hora), "d MMM · HH:mm", { locale: es })}</span>
                            <span>⏱️ {c.duracion_min} min</span>
                            {c.sala && <span>🏛️ {c.sala}</span>}
                            {c.capacidad && <span>👥 {c.inscritos}/{c.capacidad}</span>}
                          </div>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => inscribirseCharla(c.id)}>Inscribirme</button>
                      </div>
                    </div></div>
                  ))
                }
              </div>
            )}

            {tab === 'tickets' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {!evento.tickets?.length
                  ? <div className="empty-state"><div className="empty-state-icon">🎫</div><h3>Sin tickets disponibles</h3></div>
                  : evento.tickets.map(t => {
                    const agotado = t.cantidad_total - t.cantidad_vendida <= 0;
                    return (
                      <div key={t.id} className="card" style={{ border: '2px solid', borderColor: agotado ? 'var(--c-gray-200)' : 'var(--c-primary)', opacity: agotado ? .6 : 1 }}>
                        <div className="card-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                            <span className={`badge ${t.tipo === 'vip' ? 'badge-accent' : t.tipo === 'empresa' ? 'badge-success' : 'badge-primary'}`}>{t.tipo?.toUpperCase()}</span>
                            {agotado && <span className="badge badge-danger">Agotado</span>}
                          </div>
                          <h3 style={{ fontWeight: 700, marginBottom: '.25rem' }}>{t.nombre}</h3>
                          {t.descripcion && <p style={{ fontSize: '.82rem', color: 'var(--c-gray-500)', marginBottom: '.75rem' }}>{t.descripcion}</p>}
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-primary)', marginBottom: '.5rem' }}>
                            {t.precio > 0 ? `$${Number(t.precio).toFixed(2)}` : 'Gratis'}
                          </div>
                          <div style={{ fontSize: '.78rem', color: 'var(--c-gray-500)', marginBottom: '.75rem' }}>
                            {t.cantidad_total - t.cantidad_vendida} disponibles
                          </div>
                          <button className="btn btn-primary btn-full btn-sm" disabled={agotado} onClick={() => comprarTicket(t.id)}>
                            {agotado ? 'Agotado' : t.precio > 0 ? 'Comprar' : 'Obtener gratis'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            )}

            {tab === 'reuniones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {!evento.reuniones?.length
                  ? <div className="empty-state"><div className="empty-state-icon">🤝</div><h3>Sin reuniones disponibles</h3></div>
                  : evento.reuniones.map(r => {
                    const agotada = r.reservados >= r.max_asistentes;
                    return (
                      <div key={r.id} className="card"><div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                          <div>
                            <h3 style={{ fontWeight: 700, marginBottom: '.3rem' }}>{r.titulo}</h3>
                            {r.descripcion && <p style={{ fontSize: '.85rem', color: 'var(--c-gray-500)', marginBottom: '.5rem' }}>{r.descripcion}</p>}
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '.8rem', color: 'var(--c-gray-500)', flexWrap: 'wrap' }}>
                              <span>📅 {format(new Date(r.fecha_hora), "d MMM · HH:mm", { locale: es })}</span>
                              <span>⏱️ {r.duracion_min} min</span>
                              <span>👥 {r.reservados}/{r.max_asistentes} plazas</span>
                              <span style={{ color: 'var(--c-primary)', fontWeight: 700 }}>{r.precio > 0 ? `$${Number(r.precio).toFixed(2)}` : 'Gratis'}</span>
                            </div>
                          </div>
                          <button className="btn btn-secondary btn-sm" disabled={agotada} onClick={() => reservarReunion(r.id)}>
                            {agotada ? 'Sin cupo' : 'Reservar'}
                          </button>
                        </div>
                      </div></div>
                    );
                  })
                }
              </div>
            )}
          </div>

          {/* Sidebar CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 88 }}>
            <div className="card"><div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🎪</div>
              <h3 style={{ fontWeight: 700, marginBottom: '.5rem' }}>¡Únete al evento!</h3>
              <p style={{ fontSize: '.85rem', color: 'var(--c-gray-500)', marginBottom: '1rem' }}>Inscríbete para acceder a charlas, reuniones y más.</p>
              <button className="btn btn-primary btn-full" onClick={inscribirse} disabled={inscribiendo}>
                {inscribiendo ? 'Inscribiendo...' : 'Inscribirse al evento'}
              </button>
            </div></div>

            <div className="card"><div className="card-body">
              <h4 style={{ fontWeight: 700, marginBottom: '.75rem', fontSize: '.9rem' }}>Resumen</h4>
              {[['🎤', `${evento.charlas?.length || 0} charlas`], ['🎫', `${evento.tickets?.length || 0} tipos de ticket`], ['🤝', `${evento.reuniones?.length || 0} reuniones`]].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.35rem 0', fontSize: '.88rem', color: 'var(--c-gray-700)' }}>
                  <span>{icon}</span> {text}
                </div>
              ))}
            </div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
