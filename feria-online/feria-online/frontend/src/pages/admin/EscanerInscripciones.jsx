import { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminSidebar } from '../../components/common/Sidebars';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EscanerInscripciones() {
  const { eventoId } = useParams();
  const [evento, setEvento] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    api.get(`/eventos/${eventoId}`).then(r => setEvento(r.data)).catch(() => {});
  }, [eventoId]);

  const validar = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    setResultado(null);
    try {
      const res = await api.post('/inscripciones/validar-qr', { codigo_qr: codigo.trim() });
      const data = { ok: true, ...res.data };
      setResultado(data);
      setHistorial(h => [{ ...data, hora: new Date().toLocaleTimeString('es-BO') }, ...h.slice(0, 19)]);
      toast.success('¡Entrada válida!');
    } catch (err) {
      const data = { ok: false, ...err.response?.data };
      setResultado(data);
      if (err.response?.status !== 409) toast.error(data.message || 'QR inválido');
    } finally {
      setLoading(false);
      setCodigo('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const limpiar = () => {
    setResultado(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const esYaUsado = resultado && !resultado.ok && resultado.message?.includes('ya fue');

  return (
    <div className="layout-with-sidebar">
      <AdminSidebar />
      <div className="main-content">

        <div className="page-header">
          <div>
            <h1 className="page-title">Escáner de Entrada</h1>
            <p className="page-subtitle">{evento?.titulo || '...'} — Registro de asistencia</p>
          </div>
          <Link to={`/admin/inscripciones/${eventoId}`} className="btn btn-outline">← Volver a lista</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Panel principal */}
          <div>
            {/* Instrucciones */}
            <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid var(--c-accent)', borderRadius: '0 12px 12px 0' }}>
              <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
                <p style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--c-gray-700)', marginBottom: '.25rem' }}>¿Cómo usar?</p>
                <ul style={{ fontSize: '.82rem', color: 'var(--c-gray-500)', paddingLeft: '1.2rem', lineHeight: 1.8, margin: 0 }}>
                  <li>Conecta un lector QR USB — el código se ingresa automáticamente</li>
                  <li>O escribe/pega el código manualmente y presiona Enter</li>
                  <li>Solo se validan QR de participantes con pago confirmado</li>
                </ul>
              </div>
            </div>

            {/* Input */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-body">
                <label className="form-label" style={{ fontWeight: 600, marginBottom: '.75rem', display: 'block' }}>
                  Código QR
                </label>
                <div style={{ display: 'flex', gap: '.75rem' }}>
                  <input
                    ref={inputRef}
                    className="form-control"
                    placeholder="Escanea o pega el código UUID..."
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && validar()}
                    autoFocus
                    style={{ fontFamily: 'monospace', letterSpacing: '.05em', fontSize: '.88rem' }}
                  />
                  <button className="btn btn-primary" onClick={validar} disabled={loading || !codigo.trim()} style={{ minWidth: 100 }}>
                    {loading ? '⏳' : '✔ Validar'}
                  </button>
                </div>
              </div>
            </div>

            {/* Resultado */}
            {resultado && (
              <div className="card" style={{
                border: '2px solid',
                borderColor: resultado.ok ? 'var(--c-success)' : esYaUsado ? 'var(--c-warning)' : 'var(--c-danger)',
                animation: 'slideUp .2s ease',
              }}>
                <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '4.5rem', marginBottom: '.75rem', lineHeight: 1 }}>
                    {resultado.ok ? '✅' : esYaUsado ? '⚠️' : '❌'}
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem',
                    color: resultado.ok ? 'var(--c-success)' : esYaUsado ? 'var(--c-warning)' : 'var(--c-danger)',
                  }}>
                    {resultado.message}
                  </h2>

                  {resultado.asistente && (
                    <div style={{ background: 'var(--c-gray-50)', borderRadius: 12, padding: '1.25rem', textAlign: 'left', border: '1px solid var(--c-gray-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: resultado.ok ? 'var(--c-success-light)' : 'var(--c-warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>👤</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                            {resultado.asistente.nombre} {resultado.asistente.apellido}
                          </div>
                          <div style={{ fontSize: '.82rem', color: 'var(--c-gray-500)' }}>{resultado.asistente.email}</div>
                        </div>
                      </div>
                      {resultado.asistente.ciudad && (
                        <div style={{ fontSize: '.82rem', color: 'var(--c-gray-500)', marginBottom: '.35rem' }}>📍 {resultado.asistente.ciudad}</div>
                      )}
                      {resultado.fecha_asistencia && (
                        <div style={{ marginTop: '.75rem', padding: '.5rem .75rem', background: 'var(--c-warning-light)', borderRadius: 8, fontSize: '.82rem', color: '#92400E', fontWeight: 600 }}>
                          ⏰ Entrada previa: {new Date(resultado.fecha_asistencia).toLocaleString('es-BO')}
                        </div>
                      )}
                    </div>
                  )}

                  <button className="btn btn-outline" style={{ marginTop: '1.25rem' }} onClick={limpiar}>
                    Escanear otro →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Historial */}
          <div className="card" style={{ position: 'sticky', top: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: '.95rem' }}>Historial</h3>
              {historial.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={() => setHistorial([])}>Limpiar</button>
              )}
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {historial.length === 0
                ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--c-gray-500)', fontSize: '.85rem' }}>Sin escaneos aún</div>
                : historial.map((h, i) => (
                  <div key={i} style={{ padding: '.85rem 1.25rem', borderBottom: '1px solid var(--c-gray-100)', display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
                      {h.ok ? '✅' : h.message?.includes('ya fue') ? '⚠️' : '❌'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.asistente ? `${h.asistente.nombre} ${h.asistente.apellido}` : 'QR inválido'}
                      </div>
                      <div style={{ fontSize: '.75rem', color: 'var(--c-gray-500)' }}>{h.hora}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
