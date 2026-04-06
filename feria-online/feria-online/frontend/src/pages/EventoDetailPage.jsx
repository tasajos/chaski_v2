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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [inscribiendo, setInscribiendo] = useState(false);

  // Estado modal de pago
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [modalPago, setModalPago] = useState(false);
  const [paso, setPaso] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const [datosPago, setDatosPago] = useState({ nombre: '', ci: '', telefono: '' });

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

  const iniciarCompra = (ticket) => {
    if (!user) return toast.error('Debes iniciar sesión');
    setTicketSeleccionado(ticket);
    setDatosPago({ nombre: `${user.nombre} ${user.apellido}`, ci: '', telefono: '' });
    setPaso(1);
    setModalPago(true);
  };

  const procesarPago = async () => {
    setProcesando(true);
    await new Promise(r => setTimeout(r, 1800));
    setProcesando(false);
    setPaso(2);
  };

  const confirmarPago = async () => {
    setProcesando(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      await ticketsService.comprar(ticketSeleccionado.id, { cantidad: 1 });
      setPaso(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar');
    } finally {
      setProcesando(false);
    }
  };

  const cerrarModal = async () => {
    const fueExitoso = paso === 3;
    setModalPago(false);
    setPaso(1);
    setTicketSeleccionado(null);
    if (fueExitoso) {
      const r = await eventosService.getById(id);
      setEvento(r.data);
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
                          <button className="btn btn-primary btn-full btn-sm" disabled={agotado} onClick={() => iniciarCompra(t)}>
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

          {/* Sidebar */}
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

      {/* ─── MODAL DE PAGO ─────────────────────────────────────────────── */}
      {modalPago && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)',
          animation: 'fadeIn .2s ease'
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460,
            boxShadow: '0 20px 60px rgba(0,0,0,.2)', overflow: 'hidden',
            animation: 'slideUp .25s ease'
          }}>
            {/* Header del modal */}
            <div style={{
              background: 'linear-gradient(135deg, #1a0e4e, #5B4CFF)',
              padding: '1.5rem', color: '#fff', textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>
                {paso === 1 ? '🎫' : paso === 2 ? '📱' : '🎉'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>
                {paso === 1 && 'Datos del comprador'}
                {paso === 2 && 'Realizar pago'}
                {paso === 3 && '¡Compra exitosa!'}
              </h2>
              {ticketSeleccionado && paso !== 3 && (
                <p style={{ opacity: .8, fontSize: '.85rem', marginTop: '.25rem', margin: '.25rem 0 0' }}>
                  {ticketSeleccionado.nombre} — {ticketSeleccionado.precio > 0 ? `$${Number(ticketSeleccionado.precio).toFixed(2)}` : 'Gratis'}
                </p>
              )}
            </div>

            {/* Barra de pasos */}
            {paso !== 3 && (
              <div style={{ display: 'flex', gap: '.5rem', padding: '.75rem 1.5rem', background: 'var(--c-gray-50)', borderBottom: '1px solid var(--c-gray-100)' }}>
                {[1, 2].map(p => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flex: 1 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '.75rem', fontWeight: 700, flexShrink: 0,
                      background: paso >= p ? 'var(--c-primary)' : 'var(--c-gray-200)',
                      color: paso >= p ? '#fff' : 'var(--c-gray-500)'
                    }}>{p}</div>
                    <span style={{ fontSize: '.78rem', color: paso >= p ? 'var(--c-primary)' : 'var(--c-gray-400)', fontWeight: paso >= p ? 600 : 400 }}>
                      {p === 1 ? 'Tus datos' : 'Pago'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '1.5rem' }}>

              {/* PASO 1 — Datos */}
              {paso === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nombre completo *</label>
                    <input className="form-control" value={datosPago.nombre}
                      onChange={e => setDatosPago(p => ({ ...p, nombre: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cédula de identidad *</label>
                    <input className="form-control" placeholder="Ej: 12345678"
                      value={datosPago.ci}
                      onChange={e => setDatosPago(p => ({ ...p, ci: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-control" placeholder="Ej: 70000000"
                      value={datosPago.telefono}
                      onChange={e => setDatosPago(p => ({ ...p, telefono: e.target.value }))} />
                  </div>

                  {/* Resumen precio */}
                  <div style={{ background: 'var(--c-primary-light)', borderRadius: 10, padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', marginBottom: '.35rem' }}>
                      <span style={{ color: 'var(--c-gray-500)' }}>Ticket</span>
                      <span style={{ fontWeight: 600 }}>{ticketSeleccionado?.nombre}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem' }}>
                      <span style={{ color: 'var(--c-gray-500)' }}>Total</span>
                      <span style={{ fontWeight: 800, color: 'var(--c-primary)', fontSize: '1.1rem' }}>
                        {ticketSeleccionado?.precio > 0 ? `$${Number(ticketSeleccionado.precio).toFixed(2)}` : 'GRATIS'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '.75rem' }}>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={cerrarModal}>Cancelar</button>
                    <button className="btn btn-primary" style={{ flex: 2 }}
                      disabled={!datosPago.ci.trim() || !datosPago.nombre.trim() || procesando}
                      onClick={procesarPago}>
                      {procesando
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center' }}>
                            <div style={{ width: 16, height: 16, border: '2px solid #fff3', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                            Procesando...
                          </span>
                        : 'Continuar al pago →'
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2 — QR de pago */}
              {paso === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <p style={{ textAlign: 'center', fontSize: '.88rem', color: 'var(--c-gray-600)', lineHeight: 1.6 }}>
                    Escanea este QR desde tu app de banca por internet o realiza la transferencia a los datos indicados.
                  </p>

                  {/* QR simulado */}
                  <div style={{ background: '#fff', padding: '1rem', borderRadius: 14, border: '2px solid var(--c-gray-200)', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CHASKI-PAGO-${ticketSeleccionado?.id}-${datosPago.ci}`}
                      alt="QR pago"
                      style={{ width: 180, height: 180, display: 'block' }}
                    />
                  </div>

                  {/* Datos bancarios */}
                  <div style={{ width: '100%', background: 'var(--c-gray-50)', borderRadius: 10, padding: '1rem', fontSize: '.85rem' }}>
                    {[
                      ['Banco', 'Banco Mercantil Santa Cruz'],
                      ['Cuenta', '1001-234567-8-9'],
                      ['Titular', 'Chaski Eventos S.A.'],
                      ['Monto', ticketSeleccionado?.precio > 0 ? `Bs. ${(Number(ticketSeleccionado.precio) * 6.96).toFixed(2)}` : 'GRATIS'],
                      ['Referencia', `TKT-${datosPago.ci}-${ticketSeleccionado?.id}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.4rem 0', borderBottom: '1px solid var(--c-gray-200)' }}>
                        <span style={{ color: 'var(--c-gray-500)' }}>{k}</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '.75rem', width: '100%' }}>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPaso(1)}>← Atrás</button>
                    <button className="btn btn-primary" style={{ flex: 2 }}
                      onClick={confirmarPago} disabled={procesando}>
                      {procesando
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center' }}>
                            <div style={{ width: 16, height: 16, border: '2px solid #fff3', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                            Confirmando...
                          </span>
                        : '✅ Ya realicé el pago'
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3 — Éxito */}
              {paso === 3 && (
                <div style={{ textAlign: 'center', padding: '.5rem 0' }}>
                  <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', marginBottom: '.5rem' }}>
                    ¡Pago confirmado!
                  </h3>
                  <p style={{ color: 'var(--c-gray-500)', marginBottom: '1.5rem', fontSize: '.9rem', lineHeight: 1.6 }}>
                    Tu ticket fue generado con éxito. Puedes ver y descargar tu <strong>QR de entrada</strong> en la sección Mis Tickets.
                  </p>

                  <div style={{ background: 'var(--c-success-light)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', fontSize: '.85rem', textAlign: 'left' }}>
                    <div style={{ color: '#16a34a', fontWeight: 700, marginBottom: '.5rem' }}>✅ Transacción exitosa</div>
                    <div style={{ color: 'var(--c-gray-600)', lineHeight: 1.8 }}>
                      <strong>Comprador:</strong> {datosPago.nombre}<br />
                      <strong>CI:</strong> {datosPago.ci}<br />
                      <strong>Ticket:</strong> {ticketSeleccionado?.nombre}<br />
                      {ticketSeleccionado?.precio > 0 && <><strong>Monto pagado:</strong> ${Number(ticketSeleccionado.precio).toFixed(2)}</>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
                    <button className="btn btn-outline" onClick={cerrarModal}>Cerrar</button>
                    <button className="btn btn-primary" onClick={() => { cerrarModal(); navigate('/mis-compras'); }}>
                      Ver mis tickets →
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}