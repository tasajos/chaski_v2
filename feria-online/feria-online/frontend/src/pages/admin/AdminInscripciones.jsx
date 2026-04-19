import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminSidebar } from '../../components/common/Sidebars';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GENERO_LABEL = {
  masculino: 'Masculino', femenino: 'Femenino', otro: 'Otro', prefiero_no_decir: 'No indica',
};

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '18' }}>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
    </div>
  );
}

export default function AdminInscripciones() {
  const { eventoId } = useParams();
  const [evento, setEvento] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [accionId, setAccionId] = useState(null);

  const cargarDatos = useCallback(async (id) => {
    const [listRes, resRes] = await Promise.all([
      api.get(`/admin/inscripciones/${id}`),
      api.get(`/admin/inscripciones/${id}/resumen`),
    ]);
    setInscritos(listRes.data);
    setResumen(resRes.data);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get(`/eventos/${eventoId}`),
      cargarDatos(eventoId),
    ])
      .then(([r]) => setEvento(r.data))
      .catch(() => toast.error('No se pudo cargar el evento'))
      .finally(() => setLoading(false));
  }, [eventoId, cargarDatos]);

  const marcarPagado = async (id) => {
    setAccionId(id);
    try {
      const r = await api.put(`/admin/inscripciones/${id}/pagar`);
      toast.success(r.data.message);
      await cargarDatos(eventoId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar');
    } finally {
      setAccionId(null);
    }
  };

  const reenviarQR = async (id) => {
    setAccionId(id);
    try {
      const r = await api.post(`/admin/inscripciones/${id}/reenviar-qr`);
      toast.success(r.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reenviar');
    } finally {
      setAccionId(null);
    }
  };

  const descargarQR = (id, nombre, apellido) => {
    const link = document.createElement('a');
    link.href = `/api/admin/inscripciones/${id}/qr-imagen`;
    link.download = `QR-${nombre}-${apellido}.png`;
    link.click();
  };

  const filtrados = inscritos.filter(i => {
    if (filtro === 'pagados') return i.estado_pago === 'pagado';
    if (filtro === 'pendientes') return i.estado_pago === 'pendiente';
    if (filtro === 'asistieron') return i.asistio === 1;
    return true;
  }).filter(i => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return `${i.nombre} ${i.apellido} ${i.email} ${i.celular}`.toLowerCase().includes(q);
  });

  return (
    <div className="layout-with-sidebar">
      <AdminSidebar />
      <div className="main-content">

        <div className="page-header">
          <div>
            <h1 className="page-title">
              Inscripciones — {evento?.titulo || '...'}
            </h1>
            <p className="page-subtitle">
              Gestión de pagos y envío de QR
              {evento?.slug && (
                <> · <Link to={`/e/${evento.slug}`} target="_blank" style={{ color: 'var(--c-primary)', fontSize: '.82rem' }}>Ver landing 🌐</Link></>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.75rem' }}>
            <Link to={`/admin/inscripciones/${eventoId}/escanear`} className="btn btn-primary">
              📷 Escanear QR
            </Link>
            <Link to="/admin/inscripciones" className="btn btn-outline">← Eventos</Link>
          </div>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : <>
              {/* Estadísticas */}
              {resumen && (
                <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                  <StatCard icon="📋" label="Total inscritos" value={resumen.total_inscritos} color="var(--c-primary)" />
                  <StatCard icon="✅" label="Pagos confirmados" value={resumen.total_pagados} color="var(--c-success)" />
                  <StatCard icon="⏳" label="Pendientes de pago" value={resumen.total_pendientes} color="var(--c-warning)" />
                  <StatCard icon="🎪" label="Asistieron" value={resumen.total_asistieron} color="var(--c-accent)" />
                </div>
              )}

              {/* Filtros y búsqueda */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-body" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    className="form-control"
                    style={{ maxWidth: 260 }}
                    placeholder="Buscar por nombre, email, celular..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    {[
                      { key: 'todos', label: `Todos (${inscritos.length})` },
                      { key: 'pendientes', label: `Pendientes (${resumen?.total_pendientes ?? 0})` },
                      { key: 'pagados', label: `Pagados (${resumen?.total_pagados ?? 0})` },
                      { key: 'asistieron', label: `Asistieron (${resumen?.total_asistieron ?? 0})` },
                    ].map(f => (
                      <button key={f.key} onClick={() => setFiltro(f.key)}
                        className={`btn btn-sm ${filtro === f.key ? 'btn-primary' : 'btn-outline'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabla */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Lista de inscritos</h2>
                  <span style={{ fontSize: '.85rem', color: 'var(--c-gray-500)' }}>{filtrados.length} registros</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Participante</th>
                        <th>Contacto</th>
                        <th>Ciudad</th>
                        <th>Género</th>
                        <th>Pago / QR</th>
                        <th>Asistencia</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--c-gray-500)', padding: '2rem' }}>
                          No hay registros
                        </td></tr>
                      )}
                      {filtrados.map(i => (
                        <tr key={i.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{i.nombre} {i.apellido}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--c-gray-500)' }}>
                              {new Date(i.created_at).toLocaleDateString('es-BO')}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '.85rem' }}>{i.email}</div>
                            <div style={{ fontSize: '.8rem', color: 'var(--c-gray-500)' }}>{i.celular}</div>
                          </td>
                          <td style={{ fontSize: '.85rem' }}>{i.ciudad}</td>
                          <td style={{ fontSize: '.82rem', color: 'var(--c-gray-500)' }}>
                            {GENERO_LABEL[i.genero] || i.genero}
                          </td>
                          <td>
                            {i.estado_pago === 'pagado'
                              ? <span className="badge badge-success">✅ Pagado</span>
                              : <span className="badge badge-warning">⏳ Pendiente</span>
                            }
                            {i.codigo_qr && (
                              <div style={{ fontSize: '.72rem', color: i.qr_enviado ? 'var(--c-success)' : 'var(--c-danger)', marginTop: '.25rem' }}>
                                {i.qr_enviado ? 'QR enviado ✓' : 'QR no enviado'}
                              </div>
                            )}
                          </td>
                          <td>
                            {i.asistio
                              ? <div>
                                  <span className="badge badge-success">Asistió</span>
                                  <div style={{ fontSize: '.72rem', color: 'var(--c-gray-500)', marginTop: '.25rem' }}>
                                    {new Date(i.fecha_asistencia).toLocaleString('es-BO')}
                                  </div>
                                </div>
                              : <span className="badge badge-gray">Pendiente</span>
                            }
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                              {i.estado_pago === 'pendiente' && (
                                <button className="btn btn-sm btn-primary" onClick={() => marcarPagado(i.id)} disabled={accionId === i.id} title="Confirmar pago y enviar QR">
                                  {accionId === i.id ? '...' : '✅ Pagar'}
                                </button>
                              )}
                              {i.codigo_qr && (
                                <>
                                  <button className="btn btn-sm btn-secondary" onClick={() => reenviarQR(i.id)} disabled={accionId === i.id} title="Reenviar QR por correo">
                                    {accionId === i.id ? '...' : '📧 Reenviar'}
                                  </button>
                                  <button className="btn btn-sm btn-outline" onClick={() => descargarQR(i.id, i.nombre, i.apellido)} title="Descargar imagen QR">
                                    ⬇ QR
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
        }
      </div>
    </div>
  );
}
